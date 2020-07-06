"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getCcConfig;

var path = _interopRequireWildcard(require("path"));

var fs = _interopRequireWildcard(require("fs"));

var resolve = _interopRequireWildcard(require("resolve"));

var _rucksackCss = _interopRequireDefault(require("rucksack-css"));

var _autoprefixer = _interopRequireDefault(require("autoprefixer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

var markdownTransformer = path.join(__dirname, '..', 'transformers', 'markdown');
var defaultConfig = {
  port: 8000,
  source: './posts',
  output: './_site',
  theme: './_theme',
  htmlTemplate: path.join(__dirname, '../template.html'),
  transformers: [],
  devServerConfig: {},
  postcssConfig: {
    plugins: [(0, _rucksackCss["default"])(), (0, _autoprefixer["default"])()]
  },
  webpackConfig: function webpackConfig(config) {
    return config;
  },
  entryName: 'index',
  root: '/'
};

function getCcConfig(configFile) {
  var customizedConfig = fs.existsSync(configFile) ? require(configFile) : {};
  var config = Object.assign({}, defaultConfig, customizedConfig);
  config.theme = resolve.sync(config.theme, {
    basedir: process.cwd()
  });
  config.transformers = config.transformers.concat({
    test: /\.md$/,
    use: markdownTransformer
  }).map(function (_ref) {
    var test = _ref.test,
        use = _ref.use;
    return {
      test: test.toString(),
      use: use
    };
  });
  return config;
}