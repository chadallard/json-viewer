import defaults from './options/defaults';
import merge from './merge';

const NAMESPACE = "v2.options";

const Storage = {
  save(obj) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ [NAMESPACE]: obj });
    } else {
      // Fallback to localStorage for content scripts
      localStorage.setItem(NAMESPACE, JSON.stringify(obj));
    }
  },

  load() {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Use chrome.storage.local
        chrome.storage.local.get([NAMESPACE], (result) => {
          try {
            let options = result[NAMESPACE] || {};
            options = this.processOptions(options);
            resolve(options);
          } catch (e) {
            console.error('[JSONViewer] Failed to load from chrome.storage:', e);
            resolve(defaults);
          }
        });
      } else {
        // Fallback to localStorage for content scripts
        try {
          let optionsStr = localStorage.getItem(NAMESPACE);
          let options = optionsStr ? JSON.parse(optionsStr) : {};
          options = this.processOptions(options);
          resolve(options);
        } catch (e) {
          console.error('[JSONViewer] Failed to load from localStorage:', e);
          resolve(defaults);
        }
      }
    });
  },

  processOptions(options) {
    options.theme = options.theme || defaults.theme;

    // Handle addons - could be string or object
    if (options.addons) {
      if (typeof options.addons === 'string') {
        try {
          options.addons = JSON.parse(options.addons);
        } catch (e) {
          console.error('[JSONViewer] Failed to parse addons:', e);
          options.addons = {};
        }
      }
    } else {
      options.addons = {};
    }
    options.addons = merge({}, defaults.addons, options.addons);

    // Handle structure - could be string or object
    if (options.structure) {
      if (typeof options.structure === 'string') {
        try {
          options.structure = JSON.parse(options.structure);
        } catch (e) {
          console.error('[JSONViewer] Failed to parse structure:', e);
          options.structure = defaults.structure;
        }
      }
    } else {
      options.structure = defaults.structure;
    }

    options.style = options.style && options.style.length > 0 ? options.style : defaults.style;
    return options;
  },

  restoreOldOptions() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        // Check for old localStorage data and migrate it
        chrome.storage.local.get(['options'], (result) => {
          if (result.options) {
            try {
              let parsedOldOptions = JSON.parse(result.options);
              if (!parsedOldOptions || typeof parsedOldOptions !== "object") parsedOldOptions = {};

              const options = {};
              options.theme = parsedOldOptions.theme;
              options.addons = {
                prependHeader: JSON.parse(parsedOldOptions.prependHeader || defaults.addons.prependHeader),
                maxJsonSize: parseInt(parsedOldOptions.maxJsonSize || defaults.addons.maxJsonSize, 10)
              };

              // Update to at least the new max value
              if (options.addons.maxJsonSize < defaults.addons.maxJsonSize) {
                options.addons.maxJsonSize = defaults.addons.maxJsonSize;
              }

              options.addons = JSON.stringify(options.addons);
              options.structure = JSON.stringify(defaults.structure);
              options.style = defaults.style;
              this.save(options);

              // Remove old data
              chrome.storage.local.remove(['options']);
            } catch (e) {
              console.error('[JSONViewer] Failed to migrate old options:', e);
            }
          }
          resolve();
        });
      } else {
        // Fallback for content scripts
        const oldOptions = localStorage.getItem('options');
        if (oldOptions) {
          try {
            let parsedOldOptions = JSON.parse(oldOptions);
            if (!parsedOldOptions || typeof parsedOldOptions !== "object") parsedOldOptions = {};

            const options = {};
            options.theme = parsedOldOptions.theme;
            options.addons = {
              prependHeader: JSON.parse(parsedOldOptions.prependHeader || defaults.addons.prependHeader),
              maxJsonSize: parseInt(parsedOldOptions.maxJsonSize || defaults.addons.maxJsonSize, 10)
            };

            // Update to at least the new max value
            if (options.addons.maxJsonSize < defaults.addons.maxJsonSize) {
              options.addons.maxJsonSize = defaults.addons.maxJsonSize;
            }

            options.addons = JSON.stringify(options.addons);
            options.structure = JSON.stringify(defaults.structure);
            options.style = defaults.style;
            this.save(options);

            localStorage.removeItem('options');
          } catch (e) {
            console.error('[JSONViewer] Failed to migrate old options:', e);
          }
        }
        resolve();
      }
    });
  }
};

export default Storage;
