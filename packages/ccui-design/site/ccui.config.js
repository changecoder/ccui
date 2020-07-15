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
      'ccui/lib': path.join(process.cwd(), 'components'),
      'ccui/es': path.join(process.cwd(), 'components'),
      'ccui': path.join(process.cwd(), 'index')
    }

    if (isDev) {
      config.devtool = 'source-map';

      config.resolve.alias = { 
        ...config.resolve.alias, 
        react: require.resolve('react')
      }
    }

    delete config.module.noParse

    return config
  },
  theme: './site/theme',
  htmlTemplate: './site/theme/static/template.html'
}