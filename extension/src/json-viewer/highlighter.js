// CodeMirror 6 migration
// Remove all CodeMirror imports
// import { EditorView, basicSetup } from "codemirror";
// import { EditorState } from "@codemirror/state";
// import { json } from "@codemirror/lang-json";
// import { searchKeymap, search, highlightSelectionMatches } from "@codemirror/search";
// import { foldGutter, foldKeymap, foldCode, unfoldAll as cm6UnfoldAll } from "@codemirror/fold";
// import { oneDark } from "@codemirror/theme-one-dark";
// import { ViewPlugin, Decoration, DecorationSet, WidgetType } from "@codemirror/view";
// import { keymap } from "@codemirror/view";
// import { findNext, findPrevious, closeSearchPanel } from "@codemirror/search";
import merge from './merge';
import defaults from './options/defaults';
import URL_PATTERN from './url-pattern';

const F_LETTER = 70;

function Highlighter(jsonText, options) {
  this.options = options || {};
  this.text = jsonText;
  this.defaultSearch = false;
  this.theme = this.options.theme || "vs"; // Monaco default theme
  this.language = "json";
}

// ViewPlugin for clickable URLs in string tokens
function clickableUrlPlugin(options) {
  return ViewPlugin.fromClass(class {
    constructor(view) {
      this.decorations = this.buildDecorations(view);
    }
    update(update) {
      if (update.docChanged || update.viewportChanged)
        this.decorations = this.buildDecorations(update.view);
    }
    buildDecorations(view) {
      const widgets = [];
      for (let { from, to } of view.visibleRanges) {
        let text = view.state.doc.sliceString(from, to);
        let match;
        while ((match = URL_PATTERN.exec(text)) !== null) {
          const url = match[0];
          const start = from + match.index;
          const end = start + url.length;
          widgets.push(Decoration.mark({
            class: "cm-string-link",
            attributes: {
              "data-url": url,
              style: "text-decoration: underline; color: #2196f3; cursor: pointer;"
            },
            inclusive: false
          }).range(start, end));
        }
      }
      return Decoration.set(widgets, true);
    }
  }, {
    decorations: v => v.decorations,
    eventHandlers: {
      click(event, view) {
        const target = event.target;
        if (target.classList.contains("cm-string-link")) {
          const url = target.getAttribute("data-url");
          window.open(url, "_blank");
          return true;
        }
        return false;
      }
    }
  });
}

// Custom keymap for search and other editor commands
function createCustomKeymap(options) {
  const keymapRules = [];

  // Escape key: clear search and focus editor
  keymapRules.push({
    key: "Escape",
    run: (view) => {
      closeSearchPanel(view);
      view.focus();
      return true;
    }
  });

  // Read-only mode key bindings
  if (options.structure && options.structure.readOnly) {
    keymapRules.push({
      key: "Enter",
      run: (view) => {
        findNext(view);
        return true;
      }
    });
    keymapRules.push({
      key: "Shift-Enter",
      run: (view) => {
        findPrevious(view);
        return true;
      }
    });
    keymapRules.push({
      key: "Ctrl-V",
      run: () => true // Prevent paste in read-only mode
    });
    keymapRules.push({
      key: "Cmd-V",
      run: () => true // Prevent paste in read-only mode
    });
  }

  // Search key bindings
  const nativeSearch = options.addons && (options.addons.alwaysRenderAllContent || options.addons.awaysRenderAllContent);
  if (!nativeSearch) {
    keymapRules.push({
      key: "Ctrl-f",
      run: (view) => {
        // Trigger search dialog
        view.dispatch({ effects: search.reconfigure({ top: true }) });
        return true;
      }
    });
    keymapRules.push({
      key: "Cmd-f",
      run: (view) => {
        // Trigger search dialog
        view.dispatch({ effects: search.reconfigure({ top: true }) });
        return true;
      }
    });
  }

  return keymap.of(keymapRules);
}

// Theme switching function for CodeMirror 6
function createThemeExtension(themeName) {
  // Handle specific popular themes with custom extensions
  const darkThemes = [
    'dracula', 'material', 'monokai', 'cobalt', 'ambiance', 'zenburn',
    'jellybeans', 'okaidia', 'panda-syntax', 'tomorrow', 'mehdi', 'mbo',
    '3024-night', 'base16-dark', 'dark', 'midnight', 'twilight'
  ];

  const lightThemes = [
    'coy', 'funky', 'mdn-like', 'neo', 'solarized-light', 'yeti',
    'base16-light'
  ];

  // Check if it's a known dark theme
  if (darkThemes.includes(themeName)) {
    return EditorView.theme({
      "&": { fontSize: "14px" },
      ".cm-content": { fontFamily: "monospace" },
      ".cm-line": { padding: "0 4px" },
      ".cm-gutters": { backgroundColor: "transparent", border: "none" },
      ".cm-activeLine": { backgroundColor: "transparent" },
      ".cm-selectionBackground": { backgroundColor: "rgba(255, 255, 255, 0.1)" }
      // Note: CSS classes for themes are applied separately in the highlight function
    }, { dark: true });
  }

  // Check if it's a known light theme
  if (lightThemes.includes(themeName)) {
    return EditorView.theme({
      "&": { fontSize: "14px" },
      ".cm-content": { fontFamily: "monospace" },
      ".cm-line": { padding: "0 4px" },
      ".cm-gutters": { backgroundColor: "transparent", border: "none" },
      ".cm-activeLine": { backgroundColor: "transparent" },
      ".cm-selectionBackground": { backgroundColor: "rgba(0, 0, 0, 0.1)" }
      // Note: CSS classes for themes are applied separately in the highlight function
    }, { dark: false });
  }

  // For other themes, use a generic approach
  if (themeName !== 'default') {
    return EditorView.theme({
      "&": { fontSize: "14px" },
      ".cm-content": { fontFamily: "monospace" },
      ".cm-line": { padding: "0 4px" },
      ".cm-gutters": { backgroundColor: "transparent", border: "none" },
      ".cm-activeLine": { backgroundColor: "transparent" },
      ".cm-selectionBackground": { backgroundColor: "rgba(0, 0, 0, 0.1)" }
      // Note: CSS classes for themes are applied separately in the highlight function
    }, {
      dark: themeName.includes('dark') || themeName.includes('night') ||
        themeName.includes('midnight') || themeName.includes('twilight') ||
        themeName.includes('dracula') || themeName.includes('material') ||
        themeName.includes('monokai') || themeName.includes('cobalt') ||
        themeName.includes('ambiance') || themeName.includes('zenburn') ||
        themeName.includes('jellybeans') || themeName.includes('okaidia') ||
        themeName.includes('panda-syntax') || themeName.includes('tomorrow') ||
        themeName.includes('mehdi') || themeName.includes('mbo') ||
        themeName.includes('3024-night') || themeName.includes('base16-dark')
    });
  }

  // Return a light theme or default theme
  return EditorView.theme({
    "&": { fontSize: "14px" },
    ".cm-content": { fontFamily: "monospace" }
  });
}

Highlighter.prototype = {
  highlight: function (parentElement) {
    if (process.env.NODE_ENV === 'development') {
      console.debug("[JSONViewer] Creating Monaco highlighter with theme:", this.theme);
    }
    // Remove any existing Monaco editor instance
    if (this.editor && this.editor.dispose) {
      this.editor.dispose();
    }
    // Create Monaco Editor
    this.editor = monaco.editor.create(parentElement || document.body, {
      value: this.text,
      language: this.language,
      theme: this.getMonacoTheme(this.theme),
      readOnly: this.isReadOnly(),
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: 'monospace',
      lineNumbers: this.options.structure && this.options.structure.lineNumbers !== false ? 'on' : 'off',
      wordWrap: this.options.structure && this.options.structure.lineWrapping ? 'on' : 'off',
    });
    this.editor.focus();
  },

  hide: function () {
    if (this.editor && this.editor.getDomNode()) {
      this.editor.getDomNode().style.display = 'none';
    }
    this.defaultSearch = true;
  },

  show: function () {
    if (this.editor && this.editor.getDomNode()) {
      this.editor.getDomNode().style.display = 'block';
    }
    this.defaultSearch = false;
  },

  getDOMEditor: function () {
    return this.editor ? this.editor.getDomNode() : null;
  },

  isReadOnly: function () {
    return this.options.structure && this.options.structure.readOnly;
  },

  getMonacoTheme: function (themeName) {
    // Map your theme names to Monaco themes or use 'vs', 'vs-dark', 'hc-black'
    if (!themeName || themeName === 'default' || themeName === 'light') return 'vs';
    if (themeName === 'dark' || themeName.includes('dark') || themeName.includes('dracula') || themeName.includes('monokai')) return 'vs-dark';
    // Add more mappings as needed
    return 'vs';
  }
};

export default Highlighter;
