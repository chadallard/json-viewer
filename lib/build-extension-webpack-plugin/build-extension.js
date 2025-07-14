var fs = require('fs-extra');
var path = require('path');
var archiver = require('archiver');
var BuildPaths = require('../build-paths');

function copyTheme(darkness, list) {
  var paths = [];
  list.forEach(function (theme) {
    var themeCSS = theme.replace(/\.js$/, '.css');
    var themeCSSPath = 'themes/' + darkness + '/' + theme + '.css';
    var themePath = path.join(BuildPaths.EXTENSION, 'assets/' + theme);

    if (fs.existsSync(themePath + '.js') && fs.existsSync(themePath + '.css')) {
      fs.removeSync(themePath + '.js');
      fs.copySync(themePath + '.css', path.join(BuildPaths.EXTENSION, themeCSSPath));
      console.log('  copied: ' + themeCSSPath);
      paths.push(themeCSSPath);

    } else {
      console.error('  fail to copy: ' + (themePath + '.css'));
    }
  });

  return paths;
}

function BuildExtension(themes) {
  this.themes = themes;
}
BuildExtension.prototype.apply = function (compiler) {
  var self = this;
  compiler.hooks.done.tap('BuildExtension', function () {
    console.log('\n');
    console.log('-> copying files');
    fs.copySync(path.join(BuildPaths.SRC_ROOT, 'icons'), path.join(BuildPaths.EXTENSION, 'icons'));
    fs.copySync(path.join(BuildPaths.SRC_ROOT, 'pages'), path.join(BuildPaths.EXTENSION, 'pages'));

    console.log('-> copying themes');

    var availableThemes = self.themes;
    var themesCSSPaths = copyTheme('light', availableThemes.light).
      concat(copyTheme('dark', availableThemes.dark));

    var manifest = fs.readJSONSync(path.join(BuildPaths.SRC_ROOT, 'manifest.json'));

    // Handle Manifest V3 web_accessible_resources format
    if (manifest.manifest_version === 3) {
      // For Manifest V3, add theme files to the existing resources array
      if (manifest.web_accessible_resources && manifest.web_accessible_resources.length > 0) {
        // Find the first web_accessible_resources object and add themes to its resources array
        var firstResource = manifest.web_accessible_resources[0];
        if (firstResource && firstResource.resources) {
          firstResource.resources = firstResource.resources.concat(themesCSSPaths);
        }
      }
    } else {
      // For Manifest V2, keep the old behavior
      manifest.web_accessible_resources = manifest.web_accessible_resources.concat(themesCSSPaths);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log('-> dev version');
      manifest.name += ' - dev';
    }

    // Update content_scripts to use bundled files instead of chunks

    console.log('-> copying manifest.json');
    fs.outputJSONSync(path.join(BuildPaths.EXTENSION, 'manifest.json'), manifest);
  });
}

module.exports = BuildExtension;
