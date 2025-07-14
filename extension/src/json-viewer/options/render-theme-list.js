import jsonFormater from '../jsl-format';
import loadCss from '../load-css';
import themeDarkness from '../theme-darkness';
// Remove CodeMirror imports
// import { EditorView, basicSetup } from "codemirror";
// import { json } from "@codemirror/lang-json";

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

function onThemeChange(input, editor) {
  const selectedTheme = input.options[input.selectedIndex].value;
  // Split '_' to allow themes with variations (e.g: solarized dark; solarized light)
  const themeOption = selectedTheme.replace(/_/, ' ');

  const currentLinkTag = document.getElementById('selected-theme');
  if (currentLinkTag !== null) {
    document.head.removeChild(currentLinkTag);
  }

  const themeToLoad = {
    id: "selected-theme",
    path: "themes/" + themeDarkness(selectedTheme) + "/" + selectedTheme + ".css",
    checkClass: "theme-" + selectedTheme + "-css-check"
  };

  if (selectedTheme === "default") {
    // For default theme, we don't need to load any CSS
    console.log("Theme changed to default");
  } else {
    loadCss(themeToLoad).then(function () {
      console.log("Theme loaded:", themeOption);
      // Apply the theme class to the editor
      const editorElement = editor.dom;
      // Remove any existing theme classes
      editorElement.classList.remove('cm-theme-default');
      editorElement.classList.remove('cm-theme-coy');
      editorElement.classList.remove('cm-theme-funky');
      editorElement.classList.remove('cm-theme-dracula');
      editorElement.classList.remove('cm-theme-dracula-custom');
      editorElement.classList.remove('cm-theme-jellybeans');
      editorElement.classList.remove('cm-theme-material');
      editorElement.classList.remove('cm-theme-mbo');
      editorElement.classList.remove('cm-theme-mehdi');
      editorElement.classList.remove('cm-theme-midnight');
      editorElement.classList.remove('cm-theme-monokai');
      editorElement.classList.remove('cm-theme-okaidia');
      editorElement.classList.remove('cm-theme-panda-syntax');
      editorElement.classList.remove('cm-theme-solarized-dark');
      editorElement.classList.remove('cm-theme-tomorrow');
      editorElement.classList.remove('cm-theme-twilight');
      editorElement.classList.remove('cm-theme-zenburn');
      editorElement.classList.remove('cm-theme-3024-night');
      editorElement.classList.remove('cm-theme-ambiance');
      editorElement.classList.remove('cm-theme-base16-dark');
      editorElement.classList.remove('cm-theme-base16-light');
      editorElement.classList.remove('cm-theme-cobalt');
      editorElement.classList.remove('cm-theme-dark');
      editorElement.classList.remove('cm-theme-mdn-like');
      editorElement.classList.remove('cm-theme-neo');
      editorElement.classList.remove('cm-theme-solarized-light');
      editorElement.classList.remove('cm-theme-yeti');

      // Add the new theme class
      editorElement.classList.add('cm-theme-' + selectedTheme);
    });
  }
}

function renderThemeList(value) {
  const themesInput = document.getElementById('themes');
  const themesExampleInput = document.getElementById('themes-example');
  themesExampleInput.innerHTML = jsonFormater(JSON.stringify(themeJSONExample));

  // Create Monaco Editor for the theme example
  const themeEditor = monaco.editor.create(themesExampleInput.parentNode, {
    value: themesExampleInput.value,
    language: 'json',
    theme: 'vs',
    automaticLayout: true,
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'monospace',
    lineNumbers: 'on',
    wordWrap: 'on',
    readOnly: true
  });

  // Hide the textarea
  themesExampleInput.style.display = 'none';
  // Insert Monaco's DOM after the textarea
  themesExampleInput.parentNode.insertBefore(themeEditor.getDomNode(), themesExampleInput.nextSibling);

  themesInput.onchange = function () {
    const selectedTheme = themesInput.options[themesInput.selectedIndex].value;
    // Switch Monaco theme
    if (!selectedTheme || selectedTheme === 'default' || selectedTheme === 'light') {
      monaco.editor.setTheme('vs');
    } else if (selectedTheme === 'dark' || selectedTheme.includes('dark') || selectedTheme.includes('dracula') || selectedTheme.includes('monokai')) {
      monaco.editor.setTheme('vs-dark');
    } else {
      monaco.editor.setTheme('vs');
    }
  }

  const optionSelected = value;
  themesInput.appendChild(createOption(themeDefault, optionSelected));
  themesInput.appendChild(createThemeGroup("Light", themesList.light, optionSelected));
  themesInput.appendChild(createThemeGroup("Dark", themesList.dark, optionSelected));

  if (optionSelected && optionSelected !== "default") {
    themesInput.onchange();
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
