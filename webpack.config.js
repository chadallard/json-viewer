const path = require("path");
const fs = require('fs-extra');
const webpack = require("webpack");
const rimraf = require("rimraf");
const BuildPaths = require("./lib/build-paths");
const BuildExtension = require("./lib/build-extension-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const manifestData = fs.readJSONSync(path.join(BuildPaths.SRC_ROOT, 'manifest.json'));
const version = manifestData.version;

const entries = {
  viewer: ["./extension/src/viewer.js"],
  options: ["./extension/src/options.js"],
  "viewer-alert": ["./extension/styles/viewer-alert.scss"],
  backend: ["./extension/src/backend.js"],
  omnibox: ["./extension/src/omnibox.js"],
  "omnibox-page": ["./extension/src/omnibox-page.js"],
  "service-worker": ["./extension/src/service-worker.js"]
};

const findThemes = (darkness) =>
  fs.readdirSync(path.join('extension', 'themes', darkness))
    .filter(filename => /\.js$/.test(filename))
    .map(theme => theme.replace(/\.js$/, ''));

const includeThemes = (darkness, list) => {
  list.forEach(filename => {
    entries[filename] = [`./extension/themes/${darkness}/${filename}.js`];
  });
};

const lightThemes = findThemes('light');
const darkThemes = findThemes('dark');
const themes = { light: lightThemes, dark: darkThemes };

includeThemes('light', lightThemes);
includeThemes('dark', darkThemes);

console.log("Entries list:");
console.log(entries);
console.log("\n");

const config = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  context: __dirname,
  entry: entries,
  devtool: 'inline-source-map',
  output: {
    path: path.join(__dirname, "build/json_viewer/assets"),
    filename: "[name].js",
    publicPath: "assets/",
  },
  module: {
    rules: [
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader"
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.css', '.scss'],
    modules: [path.resolve(__dirname, './extension'), 'node_modules']
  },
  externals: {
    "chrome-framework": "chrome",
    "promise": "Promise"
  },
  optimization: {
    splitChunks: false
  },
  plugins: [
    new (class {
      apply(compiler) {
        compiler.hooks.beforeRun.tap('CleanBuildPlugin', () => {
          rimraf.sync('./build');
        });
      }
    })(),
    new MiniCssExtractPlugin({
      filename: "[name].css"
    }),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
        VERSION: JSON.stringify(version),
        THEMES: JSON.stringify(themes)
      }
    }),
    new BuildExtension(themes)
  ]
};

if (process.env.NODE_ENV === 'production') {
  config.optimization = {
    minimize: true
  };
}

module.exports = config;
