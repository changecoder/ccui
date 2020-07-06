"use strict";

var path = require('path');

var loaderUtils = require('loader-utils');

var resolvePlugins = require('../utils/resolve-plugins');

var context = require('../context');

var boss = require('./common/boss');

module.exports = function (content) {
  if (this.cacheable) {
    this.cacheable();
  }

  var ccConfig = context.ccConfig,
      themeConfig = context.themeConfig;

  var _callback = this.async();

  var webpackRemainingChain = loaderUtils.getRemainingRequest(this).split('!');
  var fullPath = webpackRemainingChain[webpackRemainingChain.length - 1];
  var filename = path.relative(process.cwd(), fullPath);
  var plugins = resolvePlugins(themeConfig.plugins, 'node');
  boss.queue({
    filename: filename,
    content: content,
    plugins: plugins,
    transformers: ccConfig.transformers,
    isBuild: context.isBuild,
    callback: function callback(err, result) {
      _callback(err, "module.exports = ".concat(result, ";"));
    }
  });
};