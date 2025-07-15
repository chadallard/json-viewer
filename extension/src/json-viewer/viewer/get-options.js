import chrome from 'chrome-framework';
import Storage from '../storage';

async function getOptions() {
  try {
    // Try to use chrome.storage.local directly first
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const options = await Storage.load();
      return options;
    }

    // Fallback to service worker communication
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: "GET_OPTIONS" }, function (response) {
          if (chrome.runtime.lastError) {
            // Fallback to direct storage access
            Storage.load().then(resolve).catch(reject);
            return;
          }

          const err = response && response.err;
          const value = response && response.value;

          if (err) {
            // Fallback to direct storage access
            Storage.load().then(resolve).catch(reject);
          } else {
            resolve(value);
          }
        });
      });
    }

    // Final fallback to direct storage access
    return await Storage.load();
  } catch (e) {
    console.error('[JSONViewer] Failed to get options:', e);
    throw new Error('getOptions: All methods failed - ' + e.message);
  }
}

export default getOptions;
