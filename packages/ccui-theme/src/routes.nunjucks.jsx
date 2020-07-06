const React = require('react')
const toReactElement = require('jsonml-to-react-element')
const chain = require('ramda/src/chain')

module.exports = function getRoutes(data) {

  const templateWrapper = (template) => {
    const Template = require(`{{ themePath }}/template${template.replace(/^\.\/template/, '')}`)
    
    return Template
  }

  const themeRoutes = JSON.parse('{{ themeRoutes }}')
  const routes = Array.isArray(themeRoutes) ? themeRoutes : [themeRoutes]

  const processRoute = (route) => {
    if (Array.isArray(route)) {
      route.forEach(processRoute)
      return
    }
    if (route.component) {
      const Template = templateWrapper(route.component)
      const Component = Template.default || Template
      const plugins = data.plugins.map(pluginTupple => pluginTupple[0](pluginTupple[1]))
      const converters = chain(plugin => plugin.converters || [], plugins)
      route.render = (route) => {
        return <Component {...route} pageData={data} toReactElement={jsonml => toReactElement(jsonml, converters)} />
      }
    }
    if (route.routes) {
      route.routes.forEach(processRoute)
    }
  }

  processRoute(routes)

  return routes
}