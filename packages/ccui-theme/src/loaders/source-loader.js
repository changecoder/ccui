const path = require('path')
const loaderUtils = require('loader-utils')

const resolvePlugins = require('../utils/resolve-plugins')
const context = require('../context')
const boss = require('./common/boss')

module.exports = function (content) {
  if (this.cacheable) {
    this.cacheable()
  }

  const { ccConfig, themeConfig } = context

  const callback = this.async()

  const webpackRemainingChain = loaderUtils.getRemainingRequest(this).split('!')
  const fullPath = webpackRemainingChain[webpackRemainingChain.length - 1]
  const filename = path.relative(process.cwd(), fullPath)
  const plugins = resolvePlugins(themeConfig.plugins, 'node')

  boss.queue({
    filename,
    content,
    plugins,
    transformers: ccConfig.transformers,
    isBuild: context.isBuild,
    callback(err, result) {
      callback(err, `module.exports = ${result};`)
    }
  })
}