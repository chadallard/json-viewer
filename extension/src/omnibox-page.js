import JSONUtils from './json-viewer/check-if-json';
import highlightContent from './json-viewer/highlight-content';
import loadScratchPadEditor from './json-viewer/scratch-pad/load-editor';

function onLoad() {
  var pre = document.getElementsByTagName("pre")[0];
  var query = window.location.search.substring(1);

  if (isScratchPad(query)) handleScratchPad(pre);
  else handleJSONHighlight(pre, query);
}

function isScratchPad(query) {
  return query === "scratch-pad";
}

function handleScratchPad(pre) {
  pre.hidden = true;
  loadScratchPadEditor(pre);
}

function handleJSONHighlight(pre, query) {
  if (query) {
    pre.textContent = decodeURIComponent(query);
  }
  highlightContent(pre);
}

document.addEventListener("DOMContentLoaded", onLoad, false);
