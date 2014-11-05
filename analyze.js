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

function ThreadHeader(line) {
    this.toString = function() {
        return '"' + this.name + '": ' + (this.daemon ? "daemon, " : "") + this.state;
    };

    this.isValid = function() {
        return this.hasOwnProperty('name');
    };

    THREAD_HEADER = /"(.*)" (daemon )?prio=([0-9]+) tid=(0x[0-9a-f]+) nid=(0x[0-9a-f]+) (.*)\[(0x[0-9a-f]+)\]/;
    var match = THREAD_HEADER.exec(line);
    if (match === null) {
        return undefined;
    }

    this.name = match[1];
    this.daemon = (match[2] !== null);
    this.prio = parseInt(match[3]);
    this.tid = match[4];
    this.nid = match[5];
    this.state = match[6];
    this.dontknow = match[7];
}

// Create an analyzer object
function Analyzer(text) {
    this._analyze = function(text) {
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            var threadHeader = new ThreadHeader(line);
            if (threadHeader.isValid()) {
                this._threadHeaders.push(threadHeader);
            }
        }
    };

    this.toString = function() {
        var asString = "";
        asString += "" + this._threadHeaders.length + " threads found: \n\n";
        for (var i = 0; i < this._threadHeaders.length; i++) {
            header = this._threadHeaders[i];
            asString += header + '\n';
        }
        return asString;
    };

    this._threadHeaders = [];
    this._analyze(text);
}
