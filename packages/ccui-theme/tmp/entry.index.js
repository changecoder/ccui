"use strict";

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _reactRouterDom = require("react-router-dom");

var _reactRouterConfig = require("react-router-config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var data = require('../lib/utils/data.js');

var routes = require('C:\\Users\\Administrator\\Desktop\\ccui\\packages\\ccui-theme\\tmp\\routes.index.js')(data);

_reactDom["default"].render( /*#__PURE__*/_react["default"].createElement(_reactRouterDom.BrowserRouter, null, (0, _reactRouterConfig.renderRoutes)(routes)), document.getElementById('react-content'));