import chrome from 'chrome-framework';
import Storage from './json-viewer/storage';

// Backend functionality
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

// Omnibox functionality
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  console.log('[JSONViewer] inputChanged: ' + text);
  suggest([
    {
      content: "Format JSON",
      description: "(Format JSON) Open a page with json highlighted"
    },
    {
      content: "Scratch pad",
      description: "(Scratch pad) Area to write and format/highlight JSON"
    }
  ]);
});

chrome.omnibox.onInputEntered.addListener((text) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const omniboxUrl = chrome.runtime.getURL("/pages/omnibox.html");
    const path = /scratch pad/i.test(text) ? "?scratch-page=true" : "?json=" + encodeURIComponent(text);
    const url = omniboxUrl + path;
    console.log("[JSONViewer] Opening: " + url);

    chrome.tabs.update(tabs[0].id, { url: url });
  });
}); 