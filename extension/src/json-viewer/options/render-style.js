function renderStyle(value) {
  const styleInput = document.getElementById('style');
  styleInput.innerHTML = value;

  // Create Monaco Editor
  const editor = monaco.editor.create(styleInput.parentNode, {
    value: styleInput.value,
    language: 'css',
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
    styleInput.value = editor.getValue();
  });

  // Hide the textarea
  styleInput.style.display = 'none';
  // Insert Monaco's DOM after the textarea
  styleInput.parentNode.insertBefore(editor.getDomNode(), styleInput.nextSibling);

  return editor;
}

export default renderStyle;
