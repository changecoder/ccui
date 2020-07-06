const webpackConfig = require('@ccui/tools/lib/webpack')

const { getWebpackConfig } = webpackConfig

const defaultWebpackConfig = getWebpackConfig(false)

module.exports = [ ...defaultWebpackConfig]