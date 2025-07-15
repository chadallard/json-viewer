import getOptions from './viewer/get-options';
import loadRequiredCss from './viewer/load-required-css';
import themeProvider from './theme-provider';

class LightweightHighlighter {
  constructor(jsonText, options) {
    this.options = options || {};
    this.text = jsonText;
    this.theme = this.options.theme || 'default';
    this.container = null;
    this.editor = null;
  }

  async highlight(parentElement) {
    console.log('[JSONViewer] Creating lightweight highlighter with theme:', this.theme);
    console.log('[JSONViewer] Options passed to highlighter:', this.options);

    // Create container
    this.container = document.createElement('div');
    this.container.className = 'json-viewer-container';
    this.container.style.cssText = `
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-x: auto;
      background: transparent;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      width: 100%;
      min-height: 100vh;
    `;

    // Create the highlighted content
    this.editor = document.createElement('pre');
    this.editor.className = this.theme === 'default' ? 'CodeMirror' : `cm-s-${this.theme} CodeMirror`;
    this.editor.style.cssText = `
      font-family: inherit;
      font-size: inherit;
      line-height: inherit;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-x: auto;
      background: transparent;
      border: none;
      outline: none;
      padding: 0;
      margin: 0;
      width: 100%;
      min-height: 100vh;
      color: inherit;
    `;

    // Load theme first, then apply highlighting
    await this.loadTheme();

    // Apply highlighting
    this.editor.innerHTML = this.highlightJSON(this.text);

    this.container.appendChild(this.editor);

    if (parentElement) {
      parentElement.appendChild(this.container);
    } else {
      document.body.appendChild(this.container);
    }
  }

  highlightJSON(jsonText) {
    try {
      // Parse and re-stringify to ensure valid JSON and pretty-print
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);

      return this.syntaxHighlight(formatted);
    } catch (e) {
      // If parsing fails, try to highlight the raw text
      return this.syntaxHighlight(jsonText);
    }
  }

  syntaxHighlight(text) {
    // Simple but effective JSON syntax highlighting using CodeMirror-compatible class names
    return text
      // Strings (double quotes)
      .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="cm-string">"$1"</span>')
      // Numbers
      .replace(/\b(-?\d+\.?\d*([eE][+-]?\d+)?)\b/g, '<span class="cm-number">$1</span>')
      // Booleans
      .replace(/\b(true|false)\b/g, '<span class="cm-atom">$1</span>')
      // Null
      .replace(/\bnull\b/g, '<span class="cm-atom">null</span>')
      // Property names (keys) - these are treated as strings in JSON
      .replace(/"([^"]+)":/g, '<span class="cm-property">"$1"</span>:')
      // Braces and brackets
      .replace(/([{}[\]])/g, '<span class="cm-punctuation">$1</span>')
      // Commas and colons
      .replace(/([,:])/g, '<span class="cm-punctuation">$1</span>');
  }

  async loadTheme() {
    try {
      // Use theme provider to load and apply theme
      await themeProvider.applyTheme(this.theme, this.editor);

      // Also load the base viewer CSS
      const viewerCSSPath = 'assets/viewer.css';
      if (!document.querySelector(`link[href*="${viewerCSSPath}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL(viewerCSSPath);
        document.head.appendChild(link);
      }
    } catch (error) {
      console.error('[JSONViewer] Failed to load theme:', error);
    }
  }

  hide() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  show() {
    if (this.container) {
      this.container.style.display = 'block';
    }
  }

  getDOMEditor() {
    return this.container;
  }

  dispose() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}

export default LightweightHighlighter; 