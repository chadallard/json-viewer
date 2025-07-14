import Promise from 'promise';
import loadCss from '../load-css';
import themeDarkness from '../theme-darkness';

function loadRequiredCss(options) {
  const theme = options.theme;
  const loaders = [];
  loaders.push(loadCss({
    path: "assets/viewer.css",
    checkClass: "json-viewer-css-check"
  }));

  if (theme && theme !== "default") {
    loaders.push(loadCss({
      path: "themes/" + themeDarkness(theme) + "/" + theme + ".css",
      checkClass: "theme-" + theme + "-css-check"
    }));
  }

  return Promise.all(loaders).then(function () {
    const style = document.createElement("style");
    style.rel = "stylesheet";
    style.type = "text/css";
    style.innerHTML = options.style;
    document.head.appendChild(style);
  });
}

export default loadRequiredCss;
