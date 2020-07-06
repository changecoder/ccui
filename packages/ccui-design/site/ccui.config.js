const path = require('path')

const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  port: 8001,
  hash: true,
  source: {
    components: './components'
  },
  webpackConfig(config) {
    config.resolve.alias = {
      'mkt-design': path.join(process.cwd(), 'index'),
      site: path.join(process.cwd(), 'site')
    }

    if (isDev) {
      config.devtool = 'source-map';

      config.resolve.alias = { ...config.resolve.alias, react: require.resolve('react') }
    }

    delete config.module.noParse

    return config
  },
  theme: './site/theme',
  htmlTemplate: './site/theme/static/template.html'
}