const webpack = require('webpack')

const getConfig = require('./getConfig')

const webpackConfig = {
  getWebpackConfig: getConfig,
  webpack
}

module.exports  = webpackConfig