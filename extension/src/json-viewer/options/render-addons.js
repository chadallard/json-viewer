import jsonFormater from '../jsl-format';

function renderAddons(value) {
  const addonsInput = document.getElementById('addons');
  const formattedValue = jsonFormater(JSON.stringify(value));

  // Show the textarea and set its value
  addonsInput.style.display = 'block';
  addonsInput.value = formattedValue;
  addonsInput.style.width = '100%';
  addonsInput.style.height = '250px';
  addonsInput.style.fontFamily = 'monospace';
  addonsInput.style.fontSize = '14px';
  addonsInput.style.border = '1px solid #ccc';
  addonsInput.style.borderRadius = '3px';
  addonsInput.style.padding = '10px';
  addonsInput.style.marginBottom = '20px';
  addonsInput.style.resize = 'vertical';

  // Return a simple object that mimics the Monaco editor interface
  return {
    getValue: () => addonsInput.value,
    setValue: (value) => { addonsInput.value = value; },
    onDidChangeModelContent: (callback) => {
      addonsInput.addEventListener('input', callback);
    },
    dispose: () => {
      // Clean up if needed
    }
  };
}

export default renderAddons;
