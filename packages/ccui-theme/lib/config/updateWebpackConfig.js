"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = updateWebpackConfig;

var path = _interopRequireWildcard(require("path"));

var _webpack = _interopRequireDefault(require("webpack"));

var _getStyleLoadersConfig = _interopRequireDefault(require("./getStyleLoadersConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var siteLib = path.join(__dirname, '..');
var siteLibLoaders = path.join(siteLib, 'loaders');

var context = require('../context');

function updateWebpackConfig(webpackConfig, mode) {
  var ccConfig = context.ccConfig,
      isBuild = context.isBuild;
  var styleLoadersConfig = (0, _getStyleLoadersConfig["default"])(ccConfig);
  webpackConfig.entry = {};

  if (isBuild) {
    webpackConfig.output.path = path.join(process.cwd(), ccConfig.output);
  }

  webpackConfig.output.publicPath = context.isBuild ? siteConfig.root : '/';

  if (mode === 'start') {
    styleLoadersConfig.forEach(function (config) {
      webpackConfig.module.rules.push({
        test: config.test,
        use: ['style-loader'].concat(_toConsumableArray(config.use))
      });
    });
  }

  webpackConfig.module.rules.push({
    test: function test(filename) {
      return filename === path.join(siteLib, 'utils', 'data.js');
    },
    loader: path.join(siteLibLoaders, 'cc-data-loader')
  });
  var customizedWebpackConfig = ccConfig.webpackConfig(webpackConfig, _webpack["default"]);
  var entryPath = path.join(siteLib, '..', 'tmp', "entry.".concat(ccConfig.entryName, ".js"));
  customizedWebpackConfig.entry[ccConfig.entryName] = entryPath;
  return customizedWebpackConfig;
}