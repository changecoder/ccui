"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

var React = require('react');

var _toReactElement = require('jsonml-to-react-element');

var chain = require('ramda/src/chain');

module.exports = function getRoutes(data) {
  var templateWrapper = function templateWrapper(template) {
    var Template = require("{{ themePath }}/template".concat(template.replace(/^\.\/template/, '')));

    return Template;
  };

  var themeRoutes = JSON.parse('{{ themeRoutes }}');
  var routes = Array.isArray(themeRoutes) ? themeRoutes : [themeRoutes];

  var processRoute = function processRoute(route) {
    if (Array.isArray(route)) {
      route.forEach(processRoute);
      return;
    }

    if (route.component) {
      var Template = templateWrapper(route.component);
      var Component = Template["default"] || Template;
      var plugins = data.plugins.map(function (pluginTupple) {
        return pluginTupple[0](pluginTupple[1]);
      });
      var converters = chain(function (plugin) {
        return plugin.converters || [];
      }, plugins);

      route.render = function (route) {
        return /*#__PURE__*/React.createElement(Component, _extends({}, route, {
          pageData: data,
          toReactElement: function toReactElement(jsonml) {
            return _toReactElement(jsonml, converters);
          }
        }));
      };
    }

    if (route.routes) {
      route.routes.forEach(processRoute);
    }
  };

  processRoute(routes);
  return routes;
};