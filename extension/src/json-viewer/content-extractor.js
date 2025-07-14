import Promise from 'promise';
import jsonFormater from './jsl-format';
import extractJSON from './extract-json';

const TOKEN = (Math.random() + 1).toString(36).slice(2, 7);
const WRAP_START = "<wrap_" + TOKEN + ">";
const WRAP_END = "</wrap_" + TOKEN + ">";
const NUM_REGEX = /^-?\d+\.?\d*([eE]\+)?\d*$/g;
const ESCAPED_REGEX = "(-?\\d+\\.?\\d*([eE]\\+)?\\d*)"

const WRAP_REGEX = new RegExp(
  "^" + WRAP_START + ESCAPED_REGEX + WRAP_END + "$", "g"
);

const REPLACE_WRAP_REGEX = new RegExp(
  "\"" + WRAP_START + ESCAPED_REGEX + WRAP_END + "\"", "g"
);

function contentExtractor(pre, options) {
  return new Promise(function (resolve, reject) {
    try {
      const rawJsonText = pre.textContent;
      const jsonExtracted = extractJSON(rawJsonText);
      const wrappedText = wrapNumbers(jsonExtracted);

      let jsonParsed = JSON.parse(wrappedText);
      if (options.addons.sortKeys) jsonParsed = sortByKeys(jsonParsed);

      // Validate and decode json
      let decodedJson = JSON.stringify(jsonParsed);
      decodedJson = decodedJson.replace(REPLACE_WRAP_REGEX, "$1");

      const jsonFormatted = normalize(jsonFormater(decodedJson, options.structure));
      const jsonText = normalize(rawJsonText).replace(normalize(jsonExtracted), jsonFormatted);
      resolve({ jsonText: jsonText, jsonExtracted: decodedJson });

    } catch (e) {
      reject(new Error('contentExtractor: ' + e.message));
    }
  });
}

function wrapNumbers(json) {
  return json.replace(NUM_REGEX, function (match) {
    return WRAP_START + match + WRAP_END;
  });
}

function sortByKeys(obj) {
  if (Array.isArray(obj)) {
    return obj.map(sortByKeys);
  }

  if (obj !== null && typeof obj === "object") {
    const sorted = {};
    Object.keys(obj).sort().forEach(function (key) {
      sorted[key] = sortByKeys(obj[key]);
    });
    return sorted;
  }

  return obj;
}

function normalize(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export default contentExtractor;
