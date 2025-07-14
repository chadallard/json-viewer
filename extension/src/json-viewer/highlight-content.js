import contentExtractor from './content-extractor';
import Highlighter from './highlighter';
import timestamp from './timestamp';
import exposeJson from './viewer/expose-json';
import renderExtras from './viewer/render-extras';
import renderAlert from './viewer/render-alert';
import getOptions from './viewer/get-options';
import loadRequiredCss from './viewer/load-required-css';

const oversizedJSON = (pre, options, outsideViewer) => {
  const jsonSize = pre.textContent.length;
  const accepted = options.addons.maxJsonSize;

  const loaded = jsonSize / 1024;
  const maxJsonSize = accepted * 1024;
  const isOversizedJSON = jsonSize > maxJsonSize;

  if (process.env.NODE_ENV === 'development') {
    console.debug(`[JSONViewer] JSON size: ${loaded} kbytes`);
    console.debug(`[JSONViewer] Max JSON size: ${accepted} kbytes`);
    console.debug(`[JSONViewer] ${jsonSize} > ${maxJsonSize} = ${isOversizedJSON}`);
  }

  if (isOversizedJSON) {
    console.warn(
      `[JSONViewer] Content not highlighted due to oversize. Accepted: ${accepted} kbytes, received: ${loaded} kbytes. It's possible to change this value at options -> Add-ons -> maxJsonSize`
    );

    const container = document.createElement('div');

    const message = document.createElement('div');
    message.innerHTML = '[JSONViewer] Content not highlighted due to oversize. Take a look at the console log for more information.';
    container.appendChild(message);

    const highlightAnyway = document.createElement('a');
    highlightAnyway.href = '#';
    highlightAnyway.title = 'Highlight anyway!';
    highlightAnyway.innerHTML = 'Highlight anyway!';
    highlightAnyway.onclick = e => {
      e.preventDefault();
      pre.hidden = true;
      highlightContent(pre, outsideViewer, true);
    };
    container.appendChild(highlightAnyway);

    renderAlert(pre, options, container);
  }

  return isOversizedJSON;
};

const prependHeader = (options, outsideViewer, jsonText) => {
  if (options.addons.timestamp) {
    return `${timestamp()}\n${jsonText}`;
  }
  return jsonText;
};

const highlightContent = (pre, outsideViewer, ignoreLimit) => {
  getOptions().then(options => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[JSONViewer] Options loaded:', options);
      console.debug('[JSONViewer] autoHighlight setting:', options.addons.autoHighlight);
    }

    if (!ignoreLimit && oversizedJSON(pre, options, outsideViewer)) {
      pre.hidden = false;
      return;
    }

    return contentExtractor(pre, options)
      .then(value => loadRequiredCss(options).then(() => value))
      .then(value => {
        const formatted = prependHeader(options, outsideViewer, value.jsonText);
        const highlighter = new Highlighter(formatted, options);

        if (options.addons.autoHighlight) {
          if (process.env.NODE_ENV === 'development') {
            console.debug('[JSONViewer] Auto-highlighting enabled, highlighting content');
          }
          highlighter.highlight();
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.debug('[JSONViewer] Auto-highlighting disabled, showing raw version');
          }
          highlighter.highlight();
          highlighter.hide();
          pre.hidden = false;

          console.warn(
            "[JSONViewer] You are seeing the raw version because you configured the " +
            "addon 'autoHighlight' to false. It's possible to highlight from this page, " +
            "just click at the 'RAW' button in the top-right corner. " +
            "It's possible to change this value at options -> Add-ons -> autoHighlight"
          );
        }

        // "awaysFold" was a typo but to avoid any problems I'll keep it
        // a while
        if (options.addons.alwaysFold || options.addons.awaysFold) {
          highlighter.fold();
        }

        exposeJson(value.jsonExtracted, outsideViewer);
        renderExtras(pre, options, highlighter);
      });
  }).catch(e => {
    pre.hidden = false;
    if (process.env.NODE_ENV === 'development') {
      console.error(`[JSONViewer] error: ${e.message}`, e);
    }
  });
};

export default highlightContent;
