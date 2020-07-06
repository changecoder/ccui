const fs = require('fs')
const path = require('path')

import openBrowser from 'react-dev-utils/openBrowser'
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')

import getCcConfig from './utils/get-cc-config'
import getThemeConfig from './utils/get-theme-config'
import updateWebpackConfig from './config/updateWebpackConfig';
import getWebpackCommonConfig from './config/getWebpackCommonConfig'

const { escapeWinPath } = require('./utils/escape-win-path')

const mkdirp = require('mkdirp');
const nunjucks = require('nunjucks')
nunjucks.configure({ autoescape: false })
const context = require('./context')

const tmpDirPath = path.join(__dirname, '..', 'tmp')

mkdirp.sync(tmpDirPath)

const getRoutesPath = (themePath, configEntryName)  => {
  const routesTemplate = fs.readFileSync(path.join(__dirname, 'routes.nunjucks.js')).toString()
  const routesPath = path.join(tmpDirPath, `routes.${configEntryName}.js`)
  const { ccConfig, themeConfig } = context
  fs.writeFileSync(
    routesPath,
    nunjucks.renderString(routesTemplate, {
      themePath: escapeWinPath(themePath),
      themeConfig: JSON.stringify(ccConfig.themeConfig),
      themeRoutes: JSON.stringify(themeConfig.routes)
    })
  )
  return routesPath
}

const generateEntryFile = (configTheme, configEntryName, root) => {
  const entryTemplate = fs.readFileSync(path.join(__dirname, 'entry.nunjucks.js')).toString()
  const entryPath = path.join(tmpDirPath, `entry.${configEntryName}.js`)
  const routesPath = getRoutesPath(
    path.dirname(configTheme),
    configEntryName
  )
  fs.writeFileSync(
    entryPath,
    nunjucks.renderString(entryTemplate, {
      routesPath: escapeWinPath(routesPath)
    })
  )
}

exports.start = (program) => {
  const configFile = path.join(
    process.cwd(),
    program.config || 'cc.config.js'
  )

  const ccConfig = getCcConfig(configFile)
  const themeConfig = getThemeConfig(ccConfig.theme)

  context.initialize({
    ccConfig,
    themeConfig,
  })

  mkdirp.sync(ccConfig.output)

  const template = fs.readFileSync(ccConfig.htmlTemplate).toString()
  // dev manifest
  const manifest = {
    js: [`${ccConfig.entryName}.js`],
    // inject style
    css: []
  }
  const templateData = Object.assign(
    { root: '/', manifest },
    ccConfig.htmlTemplateExtraData || {}
  )
  const templatePath = path.join(
    process.cwd(),
    ccConfig.output,
    'index.html'
  )
  fs.writeFileSync(templatePath, nunjucks.renderString(template, templateData))

  generateEntryFile(
    ccConfig.theme,
    ccConfig.entryName,
    '/'
  )

  const webpackConfig = updateWebpackConfig(getWebpackCommonConfig(), 'start')

  webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())

  const serverOptions = {
    quiet: true,
    hot: true,
    ...ccConfig.devServerConfig,
    contentBase: path.join(process.cwd(), ccConfig.output),
    historyApiFallback: true,
    host: 'localhost'
  }

  WebpackDevServer.addDevServerEntrypoints(webpackConfig, serverOptions)

  const compiler = webpack(webpackConfig)

  const server = new WebpackDevServer(compiler, serverOptions)

  server.listen(ccConfig.port, '0.0.0.0', () => openBrowser(`http://localhost:${ccConfig.port}`))
}