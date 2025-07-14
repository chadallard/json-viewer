import chrome from 'chrome-framework';
import Storage from './json-viewer/storage';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  try {
    if (request.action === "GET_OPTIONS") {
      sendResponse({ err: null, value: Storage.load() });
    }
  } catch (e) {
    console.error('[JSONViewer] error: ' + e.message, e);
    sendResponse({ err: e });
  }
});
