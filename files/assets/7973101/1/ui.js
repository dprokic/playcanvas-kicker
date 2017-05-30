var UI = pc.createScript('ui');

UI.prototype.initialize = function() {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.width = '500px';
    div.style.top = '50%';
    div.style.left = '50%';
    div.style.marginLeft = '-250px';            
    div.style.textAlign = 'center';
    div.style.color = 'white';
    div.style.fontSize = 'xx-large';
    div.style.visibility = 'hidden';

    // Add the div to the DOM as a child of the document's body element
    document.body.appendChild(div);

    this.div = div;

    // Set some default state on the UI element
    this.setText('GAME OVER');
    this.setVisibility(true);
};

UI.prototype.setVisibility = function(visible) {
    this.div.style.visibility = visible ? 'visible' : 'hidden';
};

UI.prototype.setText = function(message) {
    this.div.innerHTML = message;
};