"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var path = require('path');

var fs = require('fs');

var R = require('ramda');

var _require = require('../utils/escape-win-path'),
    escapeWinPath = _require.escapeWinPath,
    toUriPath = _require.toUriPath;

var context = require('../context');

var sourceLoaderPath = path.join(__dirname, '..', 'loaders', 'source-loader');

var ensureToBeArray = function ensureToBeArray(maybeArray) {
  return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
};

var shouldBeIgnore = function shouldBeIgnore(filename) {
  var exclude = context.ccConfig.exclude;
  return exclude && exclude.test(filename);
};

var isDirectory = function isDirectory(filename) {
  return fs.statSync(filename).isDirectory();
};

var isValidFile = function isValidFile(transformers) {
  return function (filename) {
    return transformers.some(function (_ref) {
      var test = _ref.test;
      return eval(test).test(filename);
    });
  };
};

var findValidFiles = function findValidFiles(source, transformers) {
  return R.pipe(R.reject(shouldBeIgnore), // filter 的补操作。返回结果为 R.filter 操作结果的补集。
  R.filter(R.either(isDirectory, isValidFile(transformers))), // Either返回由 || 运算符连接的两个函数的包装函数。如果两个函数中任一函数的执行结果为 truth-y，则返回其执行结果。
  R.chain(function (filename) {
    // chain 将函数映射到列表中每个元素，并将结果连接起来。 chain 在一些库中也称为 flatMap
    if (isDirectory(filename)) {
      var subFiles = fs.readdirSync(filename).map(function (subFile) {
        return path.join(filename, subFile);
      });
      return findValidFiles(subFiles, transformers);
    }

    return [filename];
  }))(source);
};

var rxSep = new RegExp("[".concat(escapeWinPath(path.sep), ".]"));

function getPropPath(filename, sources) {
  return sources.reduce(function (f, source) {
    return f.replace(source, '');
  }, filename.replace(new RegExp("".concat(path.extname(filename), "$")), '')).replace(/^\.?(?:\\|\/)+/, '').split(rxSep);
}

function filesToTreeStructure(files, sources) {
  var cleanedSources = sources.map(function (source) {
    return source.replace(/^\.?(?:\\|\/)/, '');
  });
  var filesTree = files.reduce(function (subFilesTree, filename) {
    var propLens = R.lensPath(getPropPath(filename, cleanedSources)); // lensPath返回聚焦到指定路径的 lens, 配合set view,over使用

    return R.set(propLens, filename, subFilesTree);
  }, {});
  return filesTree;
}

var generate = function generate(source) {
  var transformers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (source === null || source === undefined) {
    return {};
  }

  if (R.is(Object, source) && !Array.isArray(source)) {
    return R.map(function (value) {
      return generate(value, transformers);
    }, source);
  }

  var sources = ensureToBeArray(source);
  var validFiles = findValidFiles(sources, transformers);
  var filesTree = filesToTreeStructure(validFiles, sources);
  return filesTree;
};

var shouldLazyLoad = function shouldLazyLoad(nodePath, nodeValue, lazyLoad) {
  if (typeof lazyLoad === 'function') {
    return lazyLoad(nodePath, nodeValue);
  }

  return _typeof(nodeValue) === 'object' ? false : lazyLoad;
};

var stringifyObject = function stringifyObject(_ref2) {
  var nodePath = _ref2.nodePath,
      nodeValue = _ref2.nodeValue,
      depth = _ref2.depth,
      rest = _objectWithoutProperties(_ref2, ["nodePath", "nodeValue", "depth"]);

  var indent = '  '.repeat(depth);
  var kvStrings = R.pipe(R.toPairs, R.map(function (kv) {
    var valueString = _stringify(_objectSpread(_objectSpread({}, rest), {}, {
      nodePath: "".concat(nodePath, "/").concat(kv[0]),
      nodeValue: kv[1],
      depth: depth + 1
    }));

    return "".concat(indent, "  '").concat(kv[0], "': ").concat(valueString, ",");
  }))(nodeValue);
  return kvStrings.join('\n');
};

var lazyLoadWrapper = function lazyLoadWrapper(_ref3) {
  var filePath = _ref3.filePath,
      filename = _ref3.filename,
      isLazyLoadWrapper = _ref3.isLazyLoadWrapper;
  var isSSR = context.isSSR;
  var loaderString = isLazyLoadWrapper ? '' : "".concat(sourceLoaderPath, "!");
  return "".concat('function () {\n' + '  return new Promise(function (resolve) {\n').concat(isSSR ? '' : '    require.ensure([], function (require) {\n', "      resolve(require('").concat(escapeWinPath(loaderString)).concat(escapeWinPath(filePath), "'));\n").concat(isSSR ? '' : "    }, '".concat(toUriPath(filename), "');\n"), "  });\n") + '}';
};

var _stringify = function stringify(params) {
  var _params$nodePath = params.nodePath,
      nodePath = _params$nodePath === void 0 ? '/' : _params$nodePath,
      nodeValue = params.nodeValue,
      lazyLoad = params.lazyLoad,
      _params$depth = params.depth,
      depth = _params$depth === void 0 ? 0 : _params$depth;
  var indent = '  '.repeat(depth);
  var shouldBeLazy = shouldLazyLoad(nodePath, nodeValue, lazyLoad);
  return R.cond([// 返回一个封装了 if / else，if / else, ... 逻辑的函数 fn
  [function (n) {
    return _typeof(n) === 'object';
  }, function (obj) {
    if (shouldBeLazy) {
      var filePath = "".concat(path.join(__dirname, '..', '..', 'tmp', nodePath.replace(/^\/+/, '').replace(/\//g, '-')), ".").concat(context.ccConfig.entryName, ".js");
      var fileInnerContent = stringifyObject(_objectSpread(_objectSpread({}, params), {}, {
        nodeValue: obj,
        lazyLoad: false,
        depth: 1
      }));
      var fileContent = "module.exports = {\n".concat(fileInnerContent, "\n}");
      fs.writeFileSync(filePath, fileContent);
      return lazyLoadWrapper({
        filePath: filePath,
        filename: nodePath.replace(/^\/+/, ''),
        isLazyLoadWrapper: true
      });
    }

    var objectKVString = stringifyObject(_objectSpread(_objectSpread({}, params), {}, {
      nodePath: nodePath,
      depth: depth,
      nodeValue: obj
    }));
    return "{\n".concat(objectKVString, "\n").concat(indent, "}");
  }], [R.T, function (filename) {
    // 恒定返回 true 的函数
    var filePath = path.isAbsolute(filename) ? filename : path.join(process.cwd(), filename);

    if (shouldBeLazy) {
      return lazyLoadWrapper({
        filePath: filePath,
        filename: filename
      });
    }

    return "require('".concat(escapeWinPath(sourceLoaderPath), "!").concat(escapeWinPath(filePath), "')");
  }]])(nodeValue);
};

var processOn = function processOn(filename, fileContent, plugins) {
  var transformers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  var isBuild = arguments.length > 4 ? arguments[4] : undefined;
  var transformerIndex = -1;
  transformers.some(function (_ref4, index) {
    var test = _ref4.test;
    transformerIndex = index;
    return eval(test).test(filename);
  });
  var transformer = transformers[transformerIndex];

  var markdown = require(transformer.use)(filename, fileContent);

  var parsedMarkdown = plugins.reduce(function (markdownData, plugin) {
    return require(plugin[0])(markdownData, plugin[1], isBuild === true);
  }, markdown);
  return parsedMarkdown;
};

var traverse = function traverse(filesTree, fn) {
  Object.keys(filesTree).forEach(function (key) {
    var value = filesTree[key];

    if (typeof value === 'string') {
      fn(value);
      return;
    }

    traverse(value, fn);
  });
};

module.exports = {
  generate: generate,
  stringify: function stringify(filesTree) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return _stringify(_objectSpread({
      nodeValue: filesTree
    }, options));
  },
  process: processOn,
  traverse: traverse
};