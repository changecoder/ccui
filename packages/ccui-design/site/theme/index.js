const layoutPath = './template/Layout'
const homePath = './template/Home'
const contentPath = './template/Content'
const path = require('path')

module.exports = {
  lazyLoad(nodePath, nodeValue) {
    if (typeof nodeValue === 'string') {
      return true
    }
    return nodePath.endsWith('/demo')
  },
  pick: {
    components(markdownData) {
      const { filename } = markdownData.meta
      if (!/^components/.test(filename) || /[/\\]demo$/.test(path.dirname(filename))) {
        return null
      }
      return {
        meta: markdownData.meta
      }
    }
  },
  plugins: [
    '@changecoder/plugin-description',
    '@changecoder/plugin-react?lang=__react'
  ],
  routes: [
    {
      component: layoutPath,
      routes: [
        {
          path: "/",
          exact: true,
          component: homePath
        },
        {
          path: "/components/:name",
          component: contentPath
        }
      ]
    }
  ]
}