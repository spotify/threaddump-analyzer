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

var EMPTY_STACK = "	<empty stack>\n";

// This method is called from HTML so we need to tell JSHint it's not unused
function analyzeTextfield() { // jshint ignore: line
    var text = document.getElementById("TEXTAREA").value;

    var analyzer = new Analyzer(text);
    setOutputText(analyzer.toString());

    var unparsables = analyzer.toUnparsablesString();
    if (unparsables.length > 0) {
        setErrorsText(unparsables);
    } else {
        var errorsDiv = document.getElementById('ERRORS_DIV');
        errorsDiv.style.display = 'none';
    }
}

function htmlEscape(unescaped) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(unescaped));
    var escaped = div.innerHTML;
    return escaped;
}

function setOutputText(unescaped) {
    var outputPre = document.getElementById("OUTPUT");
    outputPre.innerHTML = htmlEscape(unescaped);

    var outputDiv = document.getElementById('OUTPUT_DIV');
    outputDiv.style.display = 'inline';
}

function setErrorsText(unescaped) {
    var errorsPre = document.getElementById("ERRORS");
    errorsPre.innerHTML = htmlEscape(unescaped);

    var errorsDiv = document.getElementById('ERRORS_DIV');
    errorsDiv.style.display = 'inline';
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
        if (line.match(FRAME) === null) {
            return false;
        }
        this._frames.push(line);
        return true;
    };

    this.toStackString = function() {
        var string = "";
        for (var i = 0; i < this._frames.length; i++) {
            var frame = this._frames[i];
            string += frame + '\n';
        }

        if (string === '') {
            return EMPTY_STACK;
        }

        return string;
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

    if (this.name === undefined) {
        return undefined;
    }

    this._frames = [];
}

function toStackWithHeadersString(stack, threads) {
    var string = '';
    if (threads.length > 4) {
        string += "" + threads.length + " threads with this stack:\n";
    }

    // Print thread headers for this stack in alphabetic order
    var headers = [];
    for (var k = 0; k < threads.length; k++) {
        headers.push(threads[k].toHeaderString());
    }
    headers.sort();
    for (var l = 0; l < headers.length; l++) {
        string += headers[l] + '\n';
    }

    string += stack;

    return string;
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
        } else if (this._currentThread !== null) {
            parsed = this._currentThread.addStackLine(line);
        }

        if (!parsed) {
            this._unparsables.push(line);
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

    this.toString = function() {
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
        var asString = "";
        asString += "" + this.threads.length + " threads found:\n";
        for (var j = 0; j < stacks.length; j++) {
            var currentStack = stacks[j];
            var threads = stacksToThreads[currentStack];
            asString += '\n' + toStackWithHeadersString(currentStack, threads);
        }

        return asString;
    };

    this.toUnparsablesString = function() {
        var string = "";
        for (var i = 0; i < this._unparsables.length; i++) {
            string += this._unparsables[i] + '\n';
        }
        return string;
    };

    this.threads = [];
    this._unparsables = [];
    this._currentThread = null;

    this._analyze(text);
}
