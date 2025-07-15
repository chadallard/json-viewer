import Storage from './storage';

class ThemeProvider {
  constructor() {
    this.themes = {
      light: [
        'coy', 'funky', 'yeti'
      ],
      dark: [
        'dark', 'dracula-custom', 'dracula', 'jellybeans', 'material', 'mehdi', 'okaidia', 'panda-syntax', 'tomorrow', 'twilight', 'zenburn'
      ]
    };
    this.currentTheme = null;
    this.loadedThemes = new Set();
  }

  getAvailableThemes() {
    return {
      light: [...this.themes.light],
      dark: [...this.themes.dark],
      all: [...this.themes.light, ...this.themes.dark]
    };
  }

  getThemeCategory(themeName) {
    if (this.themes.dark.includes(themeName)) {
      return 'dark';
    }
    if (this.themes.light.includes(themeName)) {
      return 'light';
    }
    return 'light'; // default
  }

  async loadTheme(themeName) {
    return new Promise((resolve, reject) => {
      // Handle default theme - no CSS file needed
      if (themeName === 'default') {
        this.loadedThemes.add(themeName);
        console.debug(`[ThemeProvider] Default theme selected - no CSS loading needed`);
        resolve();
        return;
      }

      if (this.loadedThemes.has(themeName)) {
        resolve();
        return;
      }

      const category = this.getThemeCategory(themeName);
      const themePath = `themes/${category}/${themeName}.css`;

      try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL(themePath);

        // Add event listeners to handle loading
        link.onload = () => {
          this.loadedThemes.add(themeName);
          console.debug(`[ThemeProvider] Loaded theme: ${themeName}`);
          resolve();
        };

        link.onerror = () => {
          console.error(`[ThemeProvider] Failed to load theme ${themeName}`);
          reject(new Error(`Failed to load theme: ${themeName}`));
        };

        document.head.appendChild(link);
      } catch (error) {
        console.error(`[ThemeProvider] Failed to load theme ${themeName}:`, error);
        reject(error);
      }
    });
  }

  async applyTheme(themeName, targetElement = document.body) {
    console.log(`[ThemeProvider] Applying theme: ${themeName} to element:`, targetElement);

    // Remove previous theme classes
    if (this.currentTheme) {
      targetElement.classList.remove(`cm-s-${this.currentTheme}`);
      console.log(`[ThemeProvider] Removed previous theme class: cm-s-${this.currentTheme}`);
    }

    // Load the new theme if not already loaded
    await this.loadTheme(themeName);

    // Apply the new theme class (only if not default)
    if (themeName !== 'default') {
      targetElement.classList.add(`cm-s-${themeName}`);
      console.log(`[ThemeProvider] Added theme class: cm-s-${themeName}`);
    } else {
      console.log(`[ThemeProvider] Default theme - no theme class added`);
    }
    this.currentTheme = themeName;

    console.log(`[ThemeProvider] Final element classes:`, targetElement.className);
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  isDarkTheme(themeName) {
    return this.themes.dark.includes(themeName);
  }

  isLightTheme(themeName) {
    return this.themes.light.includes(themeName);
  }

  // Get user's preferred theme from storage
  getUserTheme() {
    const options = Storage.load();
    return options.theme || 'default';
  }

  // Set user's preferred theme
  setUserTheme(themeName) {
    const options = Storage.load();
    options.theme = themeName;
    Storage.save(options);
  }
}

// Create a singleton instance
const themeProvider = new ThemeProvider();

export default themeProvider; 