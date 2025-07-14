import jsonFormater from '../jsl-format';

function renderAddons(value) {
  const addonsInput = document.getElementById('addons');
  addonsInput.innerHTML = jsonFormater(JSON.stringify(value));

  // Create Monaco Editor
  const editor = monaco.editor.create(addonsInput.parentNode, {
    value: addonsInput.value,
    language: 'json',
    theme: 'vs',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'monospace',
    lineNumbers: 'on',
    wordWrap: 'on',
  });

  // Sync changes back to textarea
  editor.onDidChangeModelContent(() => {
    addonsInput.value = editor.getValue();
  });

  // Hide the textarea
  addonsInput.style.display = 'none';
  // Insert Monaco's DOM after the textarea
  addonsInput.parentNode.insertBefore(editor.getDomNode(), addonsInput.nextSibling);

  return editor;
}

export default renderAddons;
