// Monaco Editor Loader
// This script ensures Monaco Editor is available globally for the options page

(function () {
  // Wait for Monaco to be available (from webpack plugin)
  function waitForMonaco() {
    if (typeof monaco !== 'undefined' && monaco.editor) {
      console.log('Monaco Editor is available');
      return;
    }

    // Check again in a moment
    setTimeout(waitForMonaco, 100);
  }

  // Start checking for Monaco
  waitForMonaco();
})(); 