import jsonFormater from '../jsl-format';
import themeProvider from '../theme-provider';
import LightweightHighlighter from '../lightweight-highlighter';
import Storage from '../storage';

const themeDefault = "default";
const themesList = process.env.THEMES;
const themeJSONExample = {
  title: "JSON Example",
  nested: {
    someInteger: 7,
    someBoolean: true,
    someArray: [
      "list of",
      "fake strings",
      "and fake keys"
    ]
  }
}

let previewHighlighter = null;

async function onThemeChange(input) {
  const selectedTheme = input.options[input.selectedIndex].value;
  console.log('Theme changed to:', selectedTheme);

  // Save the theme to storage
  const options = await Storage.load();
  options.theme = selectedTheme;
  Storage.save(options);

  if (selectedTheme === "default") {
    // For default theme, remove any theme classes
    if (previewHighlighter && previewHighlighter.editor) {
      // Remove all cm-s-* classes and set to default
      const classes = previewHighlighter.editor.className.split(' ');
      const filteredClasses = classes.filter(cls => !cls.startsWith('cm-s-'));
      previewHighlighter.editor.className = filteredClasses.join(' ');
      console.log('Applied default theme, classes:', previewHighlighter.editor.className);
    }
  } else {
    // Load and apply the theme
    console.log('Loading theme:', selectedTheme);
    themeProvider.loadTheme(selectedTheme).then(() => {
      console.log("Theme loaded:", selectedTheme);

      // Apply the theme class to the preview editor
      if (previewHighlighter && previewHighlighter.editor) {
        // Remove all existing cm-s-* classes
        const classes = previewHighlighter.editor.className.split(' ');
        const filteredClasses = classes.filter(cls => !cls.startsWith('cm-s-'));

        // Add the new theme class
        filteredClasses.push(`cm-s-${selectedTheme}`);
        previewHighlighter.editor.className = filteredClasses.join(' ');

        console.log("Applied theme class:", `cm-s-${selectedTheme}`);
        console.log("Final classes:", previewHighlighter.editor.className);
      }
    }).catch(error => {
      console.error('Failed to load theme:', error);
    });
  }
}

function renderThemeList(value) {
  console.log('Rendering theme list with value:', value);
  const themesInput = document.getElementById('themes');
  const themesExampleInput = document.getElementById('themes-example');
  const formattedExample = jsonFormater(JSON.stringify(themeJSONExample));
  themesExampleInput.innerHTML = formattedExample;

  // Create a container for the preview editor
  const editorContainer = document.createElement('div');
  editorContainer.style.width = '100%';
  editorContainer.style.height = '300px';
  editorContainer.style.border = '1px solid #ccc';
  editorContainer.style.borderRadius = '3px';
  editorContainer.style.marginBottom = '20px';
  editorContainer.style.position = 'relative';

  // Create lightweight highlighter for preview
  previewHighlighter = new LightweightHighlighter(formattedExample, { theme: value || 'default' });

  // Create the preview editor
  const previewEditor = document.createElement('pre');
  previewEditor.className = (value && value !== 'default') ? `cm-s-${value} CodeMirror` : 'CodeMirror';
  previewEditor.style.cssText = `
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-x: auto;
    background: transparent;
    border: none;
    outline: none;
    padding: 10px;
    margin: 0;
    width: 100%;
    height: 100%;
    color: inherit;
  `;

  // Apply syntax highlighting
  previewEditor.innerHTML = previewHighlighter.syntaxHighlight(formattedExample);
  previewHighlighter.editor = previewEditor;

  editorContainer.appendChild(previewEditor);

  // Hide the textarea
  themesExampleInput.style.display = 'none';
  // Insert the container after the textarea
  themesExampleInput.parentNode.insertBefore(editorContainer, themesExampleInput.nextSibling);

  // Set up theme change handler
  themesInput.onchange = function () {
    console.log('Theme input changed');
    onThemeChange(themesInput);
  }

  const optionSelected = value;
  themesInput.appendChild(createOption(themeDefault, optionSelected));
  themesInput.appendChild(createThemeGroup("Light", themesList.light, optionSelected));
  themesInput.appendChild(createThemeGroup("Dark", themesList.dark, optionSelected));

  // Load initial theme if not default
  if (optionSelected && optionSelected !== "default") {
    console.log('Loading initial theme:', optionSelected);
    themeProvider.loadTheme(optionSelected);
  }
}

function createOption(theme, optionSelected) {
  const option = document.createElement("option");
  option.value = theme
  option.text = theme;

  if (theme === optionSelected) {
    option.selected = "selected";
  }

  return option;
}

function createGroup(label) {
  const group = document.createElement("optgroup");
  group.label = label;
  return group;
}

function createThemeGroup(name, list, optionSelected) {
  const group = createGroup(name);
  list.forEach(function (theme) {
    group.appendChild(createOption(theme, optionSelected));
  });
  return group;
}

export default renderThemeList;
