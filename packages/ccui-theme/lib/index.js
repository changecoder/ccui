"use strict";

var _openBrowser = _interopRequireDefault(require("react-dev-utils/openBrowser"));

var _getCcConfig = _interopRequireDefault(require("./utils/get-cc-config"));

var _getThemeConfig = _interopRequireDefault(require("./utils/get-theme-config"));

var _updateWebpackConfig = _interopRequireDefault(require("./config/updateWebpackConfig"));

var _getWebpackCommonConfig = _interopRequireDefault(require("./config/getWebpackCommonConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fs = require('fs');

var path = require('path');

var webpack = require('webpack');

var WebpackDevServer = require('webpack-dev-server');

var _require = require('./utils/escape-win-path'),
    escapeWinPath = _require.escapeWinPath;

var mkdirp = require('mkdirp');

var nunjucks = require('nunjucks');

nunjucks.configure({
  autoescape: false
});

var context = require('./context');

var tmpDirPath = path.join(__dirname, '..', 'tmp');
mkdirp.sync(tmpDirPath);

var getRoutesPath = function getRoutesPath(themePath, configEntryName) {
  var routesTemplate = fs.readFileSync(path.join(__dirname, 'routes.nunjucks.js')).toString();
  var routesPath = path.join(tmpDirPath, "routes.".concat(configEntryName, ".js"));
  var ccConfig = context.ccConfig,
      themeConfig = context.themeConfig;
  fs.writeFileSync(routesPath, nunjucks.renderString(routesTemplate, {
    themePath: escapeWinPath(themePath),
    themeConfig: JSON.stringify(ccConfig.themeConfig),
    themeRoutes: JSON.stringify(themeConfig.routes)
  }));
  return routesPath;
};

var generateEntryFile = function generateEntryFile(configTheme, configEntryName, root) {
  var entryTemplate = fs.readFileSync(path.join(__dirname, 'entry.nunjucks.js')).toString();
  var entryPath = path.join(tmpDirPath, "entry.".concat(configEntryName, ".js"));
  var routesPath = getRoutesPath(path.dirname(configTheme), configEntryName);
  fs.writeFileSync(entryPath, nunjucks.renderString(entryTemplate, {
    routesPath: escapeWinPath(routesPath)
  }));
};

exports.start = function (program) {
  var configFile = path.join(process.cwd(), program.config || 'cc.config.js');
  var ccConfig = (0, _getCcConfig["default"])(configFile);
  var themeConfig = (0, _getThemeConfig["default"])(ccConfig.theme);
  context.initialize({
    ccConfig: ccConfig,
    themeConfig: themeConfig
  });
  mkdirp.sync(ccConfig.output);
  var template = fs.readFileSync(ccConfig.htmlTemplate).toString(); // dev manifest

  var manifest = {
    js: ["".concat(ccConfig.entryName, ".js")],
    // inject style
    css: []
  };
  var templateData = Object.assign({
    root: '/',
    manifest: manifest
  }, ccConfig.htmlTemplateExtraData || {});
  var templatePath = path.join(process.cwd(), ccConfig.output, 'index.html');
  fs.writeFileSync(templatePath, nunjucks.renderString(template, templateData));
  generateEntryFile(ccConfig.theme, ccConfig.entryName, '/');
  var webpackConfig = (0, _updateWebpackConfig["default"])((0, _getWebpackCommonConfig["default"])(), 'start');
  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());

  var serverOptions = _objectSpread(_objectSpread({
    quiet: true,
    hot: true
  }, ccConfig.devServerConfig), {}, {
    contentBase: path.join(process.cwd(), ccConfig.output),
    historyApiFallback: true,
    host: 'localhost'
  });

  WebpackDevServer.addDevServerEntrypoints(webpackConfig, serverOptions);
  var compiler = webpack(webpackConfig);
  var server = new WebpackDevServer(compiler, serverOptions);
  server.listen(ccConfig.port, '0.0.0.0', function () {
    return (0, _openBrowser["default"])("http://localhost:".concat(ccConfig.port));
  });
};