"use strict";

var fs = require('fs');

var path = require('path');

var context = require('../context');

var _require = require('../utils/source-data'),
    generate = _require.generate,
    stringify = _require.stringify,
    traverse = _require.traverse;

var resolvePlugins = require('../utils/resolve-plugins');

var boss = require('./common/boss');

module.exports = function siteDataLoader()
/* content */
{
  if (this.cacheable) {
    this.cacheable();
  }

  var ccConfig = context.ccConfig,
      themeConfig = context.themeConfig;
  var source = ccConfig.source,
      transformers = ccConfig.transformers;
  var markdown = generate(source, transformers);
  var browserPlugins = resolvePlugins(themeConfig.plugins, 'browser');
  var pluginsString = browserPlugins.map(function (plugin) {
    return "[require('".concat(plugin[0], "'), ").concat(JSON.stringify(plugin[1]), "]");
  }).join(',\n');
  var callback = this.async();
  var picked = {};
  var pickedPromises = [];

  if (themeConfig.pick) {
    var nodePlugins = resolvePlugins(themeConfig.plugins, 'node');
    traverse(markdown, function (filename) {
      var fileContent = fs.readFileSync(path.join(process.cwd(), filename)).toString();
      pickedPromises.push(new Promise(function (resolve) {
        boss.queue({
          filename: filename,
          content: fileContent,
          plugins: nodePlugins,
          transformers: ccConfig.transformers,
          isBuild: context.isBuild,
          callback: function callback(err, result) {
            var parsedMarkdown = eval("(".concat(result, ")"));
            Object.keys(themeConfig.pick).forEach(function (key) {
              if (!picked[key]) {
                picked[key] = [];
              }

              var picker = themeConfig.pick[key];
              var pickedData = picker(parsedMarkdown);

              if (pickedData) {
                picked[key].push(pickedData);
              }
            });
            resolve();
          }
        });
      }));
    });
  }

  Promise.all(pickedPromises).then(function () {
    var sourceDataString = stringify(markdown, {
      lazyLoad: themeConfig.lazyLoad
    });
    callback(null, 'module.exports = {' + "\n  markdown: ".concat(sourceDataString, ",") + "\n  picked: ".concat(JSON.stringify(picked, null, 2), ",") + "\n  plugins: [\n".concat(pluginsString, "\n],") + '\n};');
  });
};