import Promise from 'promise';
import chrome from 'chrome-framework';
import Storage from '../storage';

function getOptions() {
  return new Promise(function (resolve, reject) {
    // Check if chrome API is available
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      // Fallback to direct storage access
      try {
        const options = Storage.load();
        resolve(options);
      } catch (e) {
        reject(new Error('getOptions: Fallback failed - ' + e.message));
      }
      return;
    }

    try {
      chrome.runtime.sendMessage({ action: "GET_OPTIONS" }, function (response) {
        // Check if response is valid
        if (chrome.runtime.lastError) {
          // Fallback to direct storage access
          try {
            const options = Storage.load();
            resolve(options);
          } catch (e) {
            reject(new Error('getOptions: Fallback failed - ' + e.message));
          }
          return;
        }

        const err = response && response.err;
        const value = response && response.value;

        if (err) {
          // Fallback to direct storage access
          try {
            const options = Storage.load();
            resolve(options);
          } catch (e) {
            reject(new Error('getOptions: Fallback failed - ' + e.message));
          }
        } else {
          resolve(value);
        }
      });
    } catch (e) {
      // Fallback to direct storage access
      try {
        const options = Storage.load();
        resolve(options);
      } catch (fallbackError) {
        reject(new Error('getOptions: All methods failed - ' + fallbackError.message));
      }
    }
  });
}

export default getOptions;
