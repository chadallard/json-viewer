function bindSaveButton(editors, onSaveClicked) {
  var form = document.getElementById("options");
  form.onsubmit = function () { return false; }

  var saveButton = document.getElementById("save");
  saveButton.onclick = function (e) {
    e.preventDefault();

    var output = {};
    // For CodeMirror 6, we don't need to call save() - the content is already synced to the textareas
    // editors.forEach(function (editor) {
    //   editor.save();
    // });

    for (var i = 0; i < form.elements.length; i++) {
      var e = form.elements[i];
      if (!/-example$/.test(e.name) && e.name.length !== 0) {
        output[e.name] = e.value;
      }
    }

    onSaveClicked(output);

  }
}

export default bindSaveButton;
