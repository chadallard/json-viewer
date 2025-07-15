import jsonFormater from '../jsl-format';

function renderStructure(value) {
  const structureInput = document.getElementById('structure');
  const formattedValue = jsonFormater(JSON.stringify(value));

  // Show the textarea and set its value
  structureInput.style.display = 'block';
  structureInput.value = formattedValue;
  structureInput.style.width = '100%';
  structureInput.style.height = '250px';
  structureInput.style.fontFamily = 'monospace';
  structureInput.style.fontSize = '14px';
  structureInput.style.border = '1px solid #ccc';
  structureInput.style.borderRadius = '3px';
  structureInput.style.padding = '10px';
  structureInput.style.marginBottom = '20px';
  structureInput.style.resize = 'vertical';

  // Return a simple object that mimics the Monaco editor interface
  return {
    getValue: () => structureInput.value,
    setValue: (value) => { structureInput.value = value; },
    onDidChangeModelContent: (callback) => {
      structureInput.addEventListener('input', callback);
    },
    dispose: () => {
      // Clean up if needed
    }
  };
}

export default renderStructure;
