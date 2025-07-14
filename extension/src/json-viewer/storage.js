import defaults from './options/defaults';
import merge from './merge';

const OLD_NAMESPACE = "options";
const NAMESPACE = "v2.options";

const Storage = {
  save(obj) {
    localStorage.setItem(NAMESPACE, JSON.stringify(obj));
  },

  load() {
    let optionsStr = localStorage.getItem(NAMESPACE);
    optionsStr = this.restoreOldOptions(optionsStr);

    let options = optionsStr ? JSON.parse(optionsStr) : {};
    options.theme = options.theme || defaults.theme;
    options.addons = options.addons ? JSON.parse(options.addons) : {};
    options.addons = merge({}, defaults.addons, options.addons)
    options.structure = options.structure ? JSON.parse(options.structure) : defaults.structure;
    options.style = options.style && options.style.length > 0 ? options.style : defaults.style;
    return options;
  },

  restoreOldOptions(optionsStr) {
    const oldOptions = localStorage.getItem(OLD_NAMESPACE);
    let options = null;

    if (optionsStr === null && oldOptions !== null) {
      try {
        let parsedOldOptions = JSON.parse(oldOptions);
        if (!parsedOldOptions || typeof parsedOldOptions !== "object") parsedOldOptions = {};

        options = {};
        options.theme = parsedOldOptions.theme;
        options.addons = {
          prependHeader: JSON.parse(parsedOldOptions.prependHeader || defaults.addons.prependHeader),
          maxJsonSize: parseInt(parsedOldOptions.maxJsonSize || defaults.addons.maxJsonSize, 10)
        }

        // Update to at least the new max value
        if (options.addons.maxJsonSize < defaults.addons.maxJsonSize) {
          options.addons.maxJsonSize = defaults.addons.maxJsonSize;
        }

        options.addons = JSON.stringify(options.addons);
        options.structure = JSON.stringify(defaults.structure);
        options.style = defaults.style;
        this.save(options);

        optionsStr = JSON.stringify(options);

      } catch (e) {
        console.error('[JSONViewer] error: ' + e.message, e);

      } finally {
        localStorage.removeItem(OLD_NAMESPACE);
      }
    }

    return optionsStr;
  }
};

export default Storage;
