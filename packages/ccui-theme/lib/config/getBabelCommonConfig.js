"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = babel;
var _require = require,
    resolve = _require.resolve;

function babel() {
  return {
    presets: [resolve('@babel/preset-react'), [resolve('@babel/preset-env'), {
      targets: {
        browsers: ['last 2 versions', 'Firefox ESR', '> 1%', 'ie >= 8', 'iOS >= 8', 'Android >= 4']
      }
    }]],
    plugins: []
  };
}