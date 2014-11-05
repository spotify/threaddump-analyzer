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

function analyze_textfield() {
    var text = document.getElementById("TEXTAREA").value;

    var analyzer = new Analyzer(text);
    setOutputText(analyzer.toString());
}

function setOutputText(unescaped) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(unescaped));
    var escaped = div.innerHTML;

    var outputDiv = document.getElementById("OUTPUT");
    outputDiv.innerHTML = escaped;
}

function Thread(line) {
    this.toString = function() {
        return '"' + this.name + '": ' + (this.daemon ? "daemon, " : "") + this.state;
    };

    this.isValid = function() {
        return this.hasOwnProperty('name');
    };

    var THREAD_HEADER1 = /"(.*)" (daemon )?prio=([0-9]+) tid=(0x[0-9a-f]+) nid=(0x[0-9a-f]+) (.*) (\[(.*)\])?/;
    var match = THREAD_HEADER1.exec(line);
    if (match === null) {
        var THREAD_HEADER2 = /"(.*)" (daemon )?prio=([0-9]+) tid=(0x[0-9a-f]+) nid=(0x[0-9a-f]+) (sleeping)(\[(.*)\])?/;
        match = THREAD_HEADER2.exec(line);
    }
    if (match === null) {
        return undefined;
    }

    this.name = match[1];
    this.daemon = (match[2] !== undefined);
    this.prio = parseInt(match[3]);
    this.tid = match[4];
    this.nid = match[5];
    this.state = match[6].trim();
    this.dontknow = ((match.length >= 7) ? match[7] : undefined);
}

// Create an analyzer object
function Analyzer(text) {
    this._analyze = function(text) {
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            while (line.charAt(0) == '"' && line.indexOf(' prio=') == -1) {
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
            }
        }
    };

    this.toString = function() {
        var asString = "";
        asString += "" + this.threads.length + " threads found:\n";
        for (var i = 0; i < this.threads.length; i++) {
            var thread = this.threads[i];
            asString += '\n' + thread;
        }
        return asString;
    };

    this.threads = [];
    this._analyze(text);
}
