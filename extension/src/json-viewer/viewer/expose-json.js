function exposeJson(text, outsideViewer) {
  console.info("[JSONViewer] Your json was stored into 'window.json', enjoy!");

  if (outsideViewer) {
    window.json = JSON.parse(text);

  } else {
    const script = document.createElement("script");
    script.innerHTML = 'window.json = ' + text + ';';
    document.head.appendChild(script);
  }
}

export default exposeJson;
