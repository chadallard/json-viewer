function exposeJson(text, outsideViewer) {
  console.info("[JSONViewer] Your json was stored into 'window.json', enjoy!");

  try {
    // Parse the JSON and store it in window.json
    window.json = JSON.parse(text);
  } catch (error) {
    console.error("[JSONViewer] Failed to parse JSON for window.json:", error);
    // Fallback: store the raw text
    window.json = text;
  }
}

export default exposeJson;
