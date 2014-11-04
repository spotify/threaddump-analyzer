function analyze_textfield() {
    var text = document.getElementById("TEXTAREA").value;

    setOutputText(text);
}

function setOutputText(unescaped) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(unescaped));
    var escaped = div.innerHTML;

    var outputDiv = document.getElementById("OUTPUT");
    outputDiv.innerHTML = escaped;
}
