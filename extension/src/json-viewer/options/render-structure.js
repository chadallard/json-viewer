import jsonFormater from '../jsl-format';

function renderStructure(value) {
  const structureInput = document.getElementById('structure');
  structureInput.innerHTML = jsonFormater(JSON.stringify(value));

  // Create Monaco Editor
  const editor = monaco.editor.create(structureInput.parentNode, {
    value: structureInput.value,
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
    structureInput.value = editor.getValue();
  });

  // Hide the textarea
  structureInput.style.display = 'none';
  // Insert Monaco's DOM after the textarea
  structureInput.parentNode.insertBefore(editor.getDomNode(), structureInput.nextSibling);

  return editor;
}

export default renderStructure;
