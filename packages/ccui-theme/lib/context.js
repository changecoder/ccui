"use strict";

var isInitialized = false;

exports.initialize = function (context) {
  if (isInitialized) {
    console.error('`context` had been initialized');
    return;
  }

  Object.assign(exports, context);
  isInitialized = true;
};