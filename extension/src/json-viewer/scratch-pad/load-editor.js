import merge from '../merge';
import LightweightHighlighter from '../lightweight-highlighter';
import getOptions from '../viewer/get-options';
import loadRequiredCss from '../viewer/load-required-css';
import renderExtras from '../viewer/render-extras';
import renderFormatButton from './render-format-button';
import jsonFormater from '../jsl-format';
import JSONUtils from '../check-if-json';
import exposeJson from '../viewer/expose-json';

function loadEditor(pre) {
  getOptions().then(function (options) {
    return loadRequiredCss(options).then(function () {
      const scratchPadOptions = merge({}, options);
      scratchPadOptions.structure.readOnly = false;

      const highlighter = new LightweightHighlighter("", scratchPadOptions);
      highlighter.highlight();

      renderExtras(pre, options, highlighter);
      renderFormatButton(function () {
        const text = highlighter.editor.textContent;
        highlighter.editor.innerHTML = highlighter.syntaxHighlight(jsonFormater(text));
        if (JSONUtils.isJSON(text)) {
          exposeJson(text, true);
        }
      });

    });
  }).catch(function (e) {
    console.error('[JSONViewer] error: ' + e.message, e);
  });
}

export default loadEditor;
