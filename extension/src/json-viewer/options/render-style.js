function renderStyle(value) {
  const styleInput = document.getElementById('style');

  // Show the textarea and set its value
  styleInput.style.display = 'block';
  styleInput.value = value;
  styleInput.style.width = '100%';
  styleInput.style.height = '250px';
  styleInput.style.fontFamily = 'monospace';
  styleInput.style.fontSize = '14px';
  styleInput.style.border = '1px solid #ccc';
  styleInput.style.borderRadius = '3px';
  styleInput.style.padding = '10px';
  styleInput.style.marginBottom = '20px';
  styleInput.style.resize = 'vertical';

  // Return a simple object that mimics the Monaco editor interface
  return {
    getValue: () => styleInput.value,
    setValue: (value) => { styleInput.value = value; },
    onDidChangeModelContent: (callback) => {
      styleInput.addEventListener('input', callback);
    },
    dispose: () => {
      // Clean up if needed
    }
  };
}

export default renderStyle;
