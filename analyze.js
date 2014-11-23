/*
Copyright 2014 Spotify AB

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

/* global document */

var EMPTY_STACK = "	<empty stack>";

// This method is called from HTML so we need to tell JSHint it's not unused
function analyzeTextfield() { // jshint ignore: line
    var text = document.getElementById("TEXTAREA").value;

    var analyzer = new Analyzer(text);
    setHtml("OUTPUT", analyzer.toHtml());

    var ignores = analyzer.toIgnoresHtml();
    setHtml("IGNORED", ignores);

    var running = analyzer.toRunningHtml();
    setHtml("RUNNING", running);
}

function htmlEscape(unescaped) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(unescaped));
    var escaped = div.innerHTML;
    return escaped;
}

function setHtml(name, html) {
    var destination = document.getElementById(name);
    destination.innerHTML = html;

    var div = document.getElementById(name + '_DIV');
    div.style.display = (html.length > 0) ? 'inline' : 'none';
}

// Extracts a substring from a string.
//
// Returns an object with two properties:
// value = the first group of the extracted object
// shorterString = the string with the full contents of the regex removed
function _extract(regex, string) {
    var match = regex.exec(string);
    if (match === null) {
        return {value: undefined, shorterString: string};
    }

    return {value: match[1], shorterString: string.replace(regex, "")};
}

function Thread(line) {
    this.toString = function() {
        return this.toHeaderString() + '\n' + this.toStackString();
    };

    this.isValid = function() {
        return this.hasOwnProperty('name') && this.name !== undefined;
    };

    // Return true if the line was understood, false otherwise
    this.addStackLine = function(line) {
        var FRAME = /^\s+at .*/;
        if (line.match(FRAME) !== null) {
            this.frames.push(line);
            return true;
        }

        var THREAD_STATE = /^\s*java.lang.Thread.State: (.*)/;
        var match = line.match(THREAD_STATE);
        if (match !== null) {
            this.threadState = match[1];
            this.running = (this.threadState === "RUNNABLE") && (this.state === 'runnable');
            return true;
        }

        return false;
    };

    this.toStackString = function() {
        if (this.frames.length === 0) {
            return EMPTY_STACK;
        }

        return this.frames.join('\n');
    };

    this.toHeaderString = function() {
        var headerString = "";
        if (this.group !== undefined) {
            headerString += '"' + this.group + '"/';
        }
        headerString += '"' + this.name + '": ' + (this.daemon ? "daemon, " : "") + this.state;
        return headerString;
    };

    var match;
    match = _extract(/\[([0-9a-fx,]+)\]$/, line);
    this.dontKnow = match.value;
    line = match.shorterString;

    match = _extract(/ nid=([0-9a-fx,]+)/, line);
    this.nid = match.value;
    line = match.shorterString;

    match = _extract(/ tid=([0-9a-fx,]+)/, line);
    this.tid = match.value;
    line = match.shorterString;

    match = _extract(/ prio=([0-9]+)/, line);
    this.prio = match.value;
    line = match.shorterString;

    match = _extract(/ os_prio=([0-9a-fx,]+)/, line);
    this.osPrio = match.value;
    line = match.shorterString;

    match = _extract(/ (daemon)/, line);
    this.daemon = (match.value !== undefined);
    line = match.shorterString;

    match = _extract(/ #([0-9]+)/, line);
    this.number = match.value;
    line = match.shorterString;

    match = _extract(/ group="(.*)"/, line);
    this.group = match.value;
    line = match.shorterString;

    match = _extract(/^"(.*)" /, line);
    this.name = match.value;
    line = match.shorterString;

    this.state = line.trim();
    this.running = false;

    if (this.name === undefined) {
        return undefined;
    }

    this.frames = [];
}

function StringCounter() {
    this.addString = function(string) {
        if (!this._stringsToCounts.hasOwnProperty(string)) {
            this._stringsToCounts[string] = 0;
        }
        this._stringsToCounts[string]++;
    };

    // Returns all individual string and their counts as
    // {count:5, string:"foo"} hashes.
    this.getStrings = function() {
        var returnMe = [];

        for (var string in this._stringsToCounts) {
            var count = this._stringsToCounts[string];
            returnMe.push({count:count, string:string});
        }

        returnMe.sort(function(a, b) {
            if (a.count === b.count) {
                return a.string < b.string ? -1 : 1;
            }

            return b.count - a.count;
        });

        return returnMe;
    };

    this.toString = function() {
        var string = "";
        var countedStrings = this.getStrings();
        for (var i = 0; i < countedStrings.length; i++) {
            if (string.length > 0) {
                string += '\n';
            }
            string += countedStrings[i].count +
                " " + countedStrings[i].string;
        }
        return string;
    };

    this._stringsToCounts = {};
}

// Create an analyzer object
function Analyzer(text) {
    this._handleLine = function(line) {
        var thread = new Thread(line);
        var parsed = false;
        if (thread.isValid()) {
            this.threads.push(thread);
            this._currentThread = thread;
            parsed = true;
        } else if (/^\s*$/.exec(line)) {
            // We ignore empty lines, and lines containing only whitespace
            parsed = true;
        } else if (this._currentThread !== null) {
            parsed = this._currentThread.addStackLine(line);
        }

        if (!parsed) {
            this._ignores.addString(line);
        }
    };

    this._analyze = function(text) {
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            while (line.charAt(0) === '"' && line.indexOf('prio=') === -1) {
                // Multi line thread name
                i++;
                if (i >= lines.length) {
                    break;
                }

                // Replace thread name newline with ", "
                line += ', ' + lines[i];
            }

            this._handleLine(line);
        }
    };

    // Returns an array [{threads:, stackFrames:,} ...]. The threads:
    // field contains an array of Threads. The stackFrames contain an
    // array of strings
    this._toThreadsAndStacks = function() {
        // Map stacks to which threads have them
        var stacksToThreads = {};
        for (var i = 0; i < this.threads.length; i++) {
            var thread = this.threads[i];
            var stackString = thread.toStackString();
            if (!stacksToThreads.hasOwnProperty(stackString)) {
                stacksToThreads[stackString] = [];
            }
            stacksToThreads[stackString].push(thread);
        }

        // List stacks by popularity
        var stacks = [];
        for (var stack in stacksToThreads) {
            stacks.push(stack);
        }
        stacks.sort(function(a, b) {
            if (a === b) {
                return 0;
            }

            var scoreA = stacksToThreads[a].length;
            if (a === EMPTY_STACK) {
                scoreA = -123456;
            }

            var scoreB = stacksToThreads[b].length;
            if (b === EMPTY_STACK) {
                scoreB = -123456;
            }

            if (scoreB !== scoreA) {
                return scoreB - scoreA;
            }

            // Use stack contents as secondary sort key. This is
            // needed to get deterministic enough output for being
            // able to run our unit tests in both Node.js and in
            // Chrome.
            if (a < b) {
                return -1;
            } else {
                return 1;
            }
        });

        // Iterate over stacks and for each stack, print first all
        // threads that have it, and then the stack itself.
        var threadsAndStacks = [];
        for (var j = 0; j < stacks.length; j++) {
            var currentStack = stacks[j];
            var threads = stacksToThreads[currentStack];

            threads.sort(function(a, b){
                var aHeader = a.toHeaderString();
                var bHeader = b.toHeaderString();
                if (aHeader > bHeader) {
                    return 1;
                }
                if (aHeader < bHeader) {
                    return -1;
                }
                return 0;
            });

            threadsAndStacks.push({
                threads: threads,
                stackFrames: currentStack.split('\n')
            });
        }

        return threadsAndStacks;
    };

    this.toString = function() {
        var threadsAndStacks = this._toThreadsAndStacks();

        var asString = "";
        asString += "" + this.threads.length + " threads found:\n";
        for (var i = 0; i < threadsAndStacks.length; i++) {
            var currentThreadsAndStack = threadsAndStacks[i];
            var stackFrames = currentThreadsAndStack.stackFrames;
            var threads = currentThreadsAndStack.threads;

            asString += '\n';

            if (threads.length > 4) {
                asString += "" + threads.length + " threads with this stack:\n";
            }

            for (var j = 0; j < threads.length; j++) {
                asString += threads[j].toHeaderString() + '\n';
            }

            for (var k = 0; k < stackFrames.length; k++) {
                asString += stackFrames[k] + "\n";
            }
        }

        return asString;
    };

    this.toHtml = function() {
        var threadsAndStacks = this._toThreadsAndStacks();

        var asHtml = "";
        asHtml += '<h2>' + this.threads.length + " threads found</h2>\n";
        for (var i = 0; i < threadsAndStacks.length; i++) {
            var currentThreadsAndStack = threadsAndStacks[i];
            var stackFrames = currentThreadsAndStack.stackFrames;
            var threads = currentThreadsAndStack.threads;

            asHtml += '<div class="threadgroup">\n';
            if (threads.length > 4) {
                asHtml += '<div class="threadcount">' + threads.length + " threads with this stack:</div>\n";
            } else {
                // Having an empty div here makes all paragraphs, both
                // those with and those without headings evenly spaced.
                asHtml += '<div class="threadcount"></div>\n';
            }

            for (var j = 0; j < threads.length; j++) {
                asHtml += '<div class="raw">' + htmlEscape(threads[j].toHeaderString()) + '</div>\n';
            }

            for (var k = 0; k < stackFrames.length; k++) {
                asHtml += '<div class="raw">' + htmlEscape(stackFrames[k]) + "</div>\n";
            }
            asHtml += '</div>\n';
        }

        return asHtml;
    };

    this.toIgnoresString = function() {
        return this._ignores.toString() + '\n';
    };

    this.toIgnoresHtml = function() {
        var html = "";
        var countedIgnores = this._ignores.getStrings();
        for (var i = 0; i < countedIgnores.length; i++) {
            html += '<tr><td class="right-align">' +
                countedIgnores[i].count +
                '</td><td class="raw">' +
                " " + htmlEscape(countedIgnores[i].string) +
                "</td></tr>\n";
        }
        return html;
    };

    this.toRunningString = function() {
        return this._getCountedRunningMethods().toString();
    };

    this.toRunningHtml = function() {
        var html = "";
        var countedRunning = this._getCountedRunningMethods();
        for (var i = 0; i < countedRunning.length; i++) {
            html += '<tr><td class="right-align">' +
                countedRunning[i].count +
                '</td><td class="raw">' +
                " " + htmlEscape(countedRunning[i].string) +
                "</td></tr>\n";
        }
        return html;
    };

    this._getCountedRunningMethods = function() {
        var countedRunning = new StringCounter();
        for (var i = 0; i < this.threads.length; i++) {
            var thread = this.threads[i];
            if (!thread.running) {
                continue;
            }

            if (thread.frames.length ===  0) {
                continue;
            }

            var runningMethod = thread.frames[0].replace(/^\s+at /, '');
            countedRunning.addString(runningMethod);
        }

        return countedRunning;
    };

    this.threads = [];
    this._ignores = new StringCounter();
    this._currentThread = null;

    this._analyze(text);
}
