import * as path from 'path'
import webpack from 'webpack'

import getStyleLoadersConfig from './getStyleLoadersConfig'

const siteLib = path.join(__dirname, '..')
const siteLibLoaders = path.join(siteLib, 'loaders')
const context = require('../context')

export default function updateWebpackConfig(webpackConfig, mode) {
  const { ccConfig, isBuild } = context

  const styleLoadersConfig = getStyleLoadersConfig(ccConfig)

  webpackConfig.entry = {}

  if (isBuild) {
    webpackConfig.output.path = path.join(process.cwd(), ccConfig.output)
  }
  webpackConfig.output.publicPath = context.isBuild ? siteConfig.root : '/'

  if (mode === 'start') {
    styleLoadersConfig.forEach((config) => {
      webpackConfig.module.rules.push({
        test: config.test,
        use: ['style-loader', ...config.use]
      })
    })
  }

  webpackConfig.module.rules.push({
    test(filename) {
      return filename === path.join(siteLib, 'utils', 'data.js')
    },
    loader: path.join(siteLibLoaders, 'cc-data-loader')
  })

  const customizedWebpackConfig = ccConfig.webpackConfig(
    webpackConfig,
    webpack
  )

  const entryPath = path.join(
    siteLib,
    '..',
    'tmp',
    `entry.${ccConfig.entryName}.js`
  )

  customizedWebpackConfig.entry[ccConfig.entryName] = entryPath

  return customizedWebpackConfig
}