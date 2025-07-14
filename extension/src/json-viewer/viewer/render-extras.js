import chrome from 'chrome-framework';
import svgGear from './svg-gear';
import svgRaw from './svg-raw';
import svgUnfold from './svg-unfold';

function renderExtras(pre, options, highlighter) {
  const extras = document.createElement("div");
  extras.className = "extras";

  if (!options.addons.autoHighlight) {
    extras.className += ' auto-highlight-off';
  }

  const optionsLink = document.createElement("a");
  optionsLink.className = "json_viewer icon gear";
  optionsLink.href = chrome.runtime.getURL("/pages/options.html");
  optionsLink.target = "_blank";
  optionsLink.title = "Options";
  optionsLink.innerHTML = svgGear;

  const rawLink = document.createElement("a");
  rawLink.className = "json_viewer icon raw";
  rawLink.href = "#";
  rawLink.title = "Original JSON toggle";
  rawLink.innerHTML = svgRaw;
  rawLink.onclick = function (e) {
    e.preventDefault();

    if (pre.hidden) {
      // Raw enabled
      highlighter.hide();
      pre.hidden = false;
      extras.className += ' auto-highlight-off';

    } else {
      // Raw disabled
      highlighter.show();
      pre.hidden = true;
      extras.className = extras.className.replace(/\s+auto-highlight-off/, '');
    }
  }

  const unfoldLink = document.createElement("a");
  unfoldLink.className = "json_viewer icon unfold";
  unfoldLink.href = "#";
  unfoldLink.title = "Fold/Unfold all toggle";
  unfoldLink.innerHTML = svgUnfold;
  unfoldLink.onclick = function (e) {
    e.preventDefault();
    const value = pre.getAttribute('data-folded')

    if (value === 'true' || value === true) {
      highlighter.unfoldAll();
      pre.setAttribute('data-folded', false)

    } else {
      highlighter.fold();
      pre.setAttribute('data-folded', true)
    }
  }

  extras.appendChild(optionsLink);
  extras.appendChild(rawLink);

  // "awaysFold" was a typo but to avoid any problems I'll keep it
  // a while
  pre.setAttribute('data-folded', options.addons.alwaysFold || options.addons.awaysFold)
  extras.appendChild(unfoldLink);

  document.body.appendChild(extras);
}

export default renderExtras;
