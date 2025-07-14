import './options-styles';

// Import Monaco to ensure it's available
import * as monaco from 'monaco-editor';
window.monaco = monaco;

import sweetAlert from 'sweetalert';

import Storage from './json-viewer/storage';
import renderThemeList from './json-viewer/options/render-theme-list';
import renderAddons from './json-viewer/options/render-addons';
import renderStructure from './json-viewer/options/render-structure';
import renderStyle from './json-viewer/options/render-style';
import bindSaveButton from './json-viewer/options/bind-save-button';
import bindResetButton from './json-viewer/options/bind-reset-button';

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') return './json.worker.js';
    if (label === 'css') return './css.worker.js';
    return './editor.worker.js';
  }
};

function isValidJSON(pseudoJSON) {
  try {
    JSON.parse(pseudoJSON);
    return true;

  } catch (e) {
    return false;
  }
}

function renderVersion() {
  let version = "dev";
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getManifest) {
    const manifest = chrome.runtime.getManifest();
    version = manifest.version;
  }

  const versionLink = document.getElementsByClassName('version')[0];
  if (versionLink) {
    versionLink.innerHTML = version;
    versionLink.href = "https://github.com/chadallard/json-viewer/tree/" + version;
  }
}

function onLoaded() {
  const currentOptions = Storage.load();

  renderVersion();
  renderThemeList(currentOptions.theme);
  const addonsEditor = renderAddons(currentOptions.addons);
  const structureEditor = renderStructure(currentOptions.structure);
  const styleEditor = renderStyle(currentOptions.style);

  bindResetButton();
  bindSaveButton([addonsEditor, structureEditor, styleEditor], function (options) {
    if (!isValidJSON(options.addons)) {
      sweetAlert("Ops!", "\"Add-ons\" isn't a valid JSON", "error");

    } else if (!isValidJSON(options.structure)) {
      sweetAlert("Ops!", "\"Structure\" isn't a valid JSON", "error");

    } else {
      Storage.save(options);
      sweetAlert("Success", "Options saved!", "success");
    }
  });
}

document.addEventListener("DOMContentLoaded", onLoaded, false);
