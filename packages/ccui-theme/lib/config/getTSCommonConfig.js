"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = ts;

function ts() {
  return {
    target: 'es6',
    jsx: 'preserve',
    moduleResolution: 'node',
    declaration: false
  };
}