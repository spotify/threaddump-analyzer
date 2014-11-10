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

var EMPTY_STACK = "	<empty stack>\n";

function analyze_textfield() {
    var text = document.getElementById("TEXTAREA").value;

    var analyzer = new Analyzer(text);
    setOutputText(analyzer.toString());
}

function setOutputText(unescaped) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(unescaped));
    var escaped = div.innerHTML;

    var outputPre = document.getElementById("OUTPUT");
    outputPre.innerHTML = escaped;

    var outputDiv = document.getElementById('OUTPUT_DIV');
    outputDiv.style.display = 'inline';
}

function Thread(line) {
    this.toString = function() {
        return this.toHeaderString() + '\n' + this.toStackString();
    };

    this.isValid = function() {
        return this.hasOwnProperty('name');
    };

    this.addStackLine = function(line) {
        var FRAME = /^\s+at .*/;
        if (line.match(FRAME) === null) {
            return;
        }
        this._frames.push(line);
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
        return '"' + this.name + '": ' + (this.daemon ? "daemon, " : "") + this.state;
    };

    var THREAD_HEADER1 = /"(.*)" (#[0-9]+ )?(daemon )?(prio=([0-9]+) )?(os_prio=([0-9]+) )?tid=([x0-9a-f]+) nid=([x0-9a-f]+) (.*) ?(\[(.*)\])/;
    var match = THREAD_HEADER1.exec(line);
    if (match === null) {
        var THREAD_HEADER2 = /"(.*)" (#[0-9]+ )?(daemon )?(prio=([0-9]+) )?(os_prio=([0-9]+) )?tid=([x0-9a-f]+) nid=([x0-9a-f]+) (.*)/;
        match = THREAD_HEADER2.exec(line);
    }
    if (match === null) {
        return undefined;
    }

    this._frames = [];

    this.name = match[1];
    if (match[2] !== undefined) {
        this.number = match[2];
    }
    this.daemon = (match[3] !== undefined);
    // match[4] is the prio parenthesis
    if (match[5] !== undefined) {
        this.prio = parseInt(match[5]);
    }
    // match[6] is the os_prio parenthesis
    if (match[7] !== undefined) {
        this.os_prio = parseInt(match[7]);
    }
    this.tid = match[8];
    this.nid = match[9];
    this.state = match[10].trim();
    this.dontknow = ((match.length >= 11) ? match[11] : undefined);
}

// Create an analyzer object
function Analyzer(text) {
    this._analyze = function(text) {
        var lines = text.split('\n');
        var currentThread = null;
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            while (line.charAt(0) == '"' && line.indexOf('prio=') == -1) {
                // Multi line thread name
                i++;
                if (i >= lines.length) {
                    break;
                }

                // Replace thread name newline with ", "
                line += ', ' + lines[i];
            }

            var thread = new Thread(line);
            if (thread.isValid()) {
                this.threads.push(thread);
                currentThread = thread;
            } else if (currentThread !== null) {
                currentThread.addStackLine(line);
            }
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
            var a_score = stacksToThreads[a].length;
            if (a === EMPTY_STACK) {
                a_score = -123456;
            }

            var b_score = stacksToThreads[b].length;
            if (b === EMPTY_STACK) {
                b_score = -123456;
            }

            return b_score - a_score;
        });

        // Iterate over stacks and for each stack, print first all
        // threads that have it, and then the stack itself.
        var asString = "";
        asString += "" + this.threads.length + " threads found:\n";
        for (var j = 0; j < stacks.length; j++) {
            var currentStack = stacks[j];

            asString += '\n';

            var threads = stacksToThreads[currentStack];
            if (threads.length > 4) {
                asString += "" + threads.length + " threads with this stack:\n";
            }
            for (var k = 0; k < threads.length; k++) {
                var currentThread = threads[k];

                asString += threads[k].toHeaderString() + "\n";
            }
            asString += currentStack;
        }

        return asString;
    };

    this.threads = [];
    this._analyze(text);
}
