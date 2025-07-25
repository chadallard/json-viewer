import chrome from 'chrome-framework';

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
