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

// Create an analyzer object
function Analyzer(text) {
    this._analyze = function(text) {
        var lines = text.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            this.asString += line + '\n';
        }
    };

    this.toString = function() {
        return this.asString;
    };

    this.asString = "";
    this._analyze(text);
}
