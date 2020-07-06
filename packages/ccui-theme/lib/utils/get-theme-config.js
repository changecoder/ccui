"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = getThemeConfig;

function getThemeConfig(configFile) {
  var customizedConfig = require(configFile);

  var config = Object.assign({
    plugins: []
  }, customizedConfig);
  return config;
}