import chrome from 'chrome-framework';
import Storage from './json-viewer/storage';

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  try {
    if (request.action === "GET_OPTIONS") {
      // Use chrome.storage.local in service worker
      Storage.load().then(options => {
        sendResponse({ err: null, value: options });
      }).catch(error => {
        console.error('[JSONViewer] Failed to load options:', error);
        sendResponse({ err: error });
      });
      return true; // Keep the message channel open for async response
    }
  } catch (e) {
    console.error('[JSONViewer] error: ' + e.message, e);
    sendResponse({ err: e });
  }
});
