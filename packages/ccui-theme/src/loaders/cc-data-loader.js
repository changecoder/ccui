const fs = require('fs')
const path = require('path')

const context = require('../context')
const { generate, stringify, traverse } = require('../utils/source-data')
const resolvePlugins = require('../utils/resolve-plugins')
const boss = require('./common/boss')

module.exports = function siteDataLoader(/* content */) {

  if (this.cacheable) {
    this.cacheable()
  }

  const { ccConfig, themeConfig } = context

  const { source, transformers } = ccConfig

  const markdown = generate(source, transformers)
  const browserPlugins = resolvePlugins(themeConfig.plugins, 'browser')
  const pluginsString = browserPlugins
    .map(plugin => `[require('${plugin[0]}'), ${JSON.stringify(plugin[1])}]`)
    .join(',\n')

  const callback = this.async()

  const picked = {}
  const pickedPromises = []
  if (themeConfig.pick) {
    const nodePlugins = resolvePlugins(themeConfig.plugins, 'node')
    traverse(markdown, (filename) => {
      const fileContent = fs.readFileSync(path.join(process.cwd(), filename)).toString()
      pickedPromises.push(new Promise((resolve) => {
        boss.queue({
          filename,
          content: fileContent,
          plugins: nodePlugins,
          transformers: ccConfig.transformers,
          isBuild: context.isBuild,
          callback(err, result) {
            const parsedMarkdown = eval(`(${result})`); 
  
            Object.keys(themeConfig.pick).forEach((key) => {
              if (!picked[key]) {
                picked[key] = []
              }
  
              const picker = themeConfig.pick[key]
              const pickedData = picker(parsedMarkdown)
              if (pickedData) {
                picked[key].push(pickedData)
              }
            })
  
            resolve()
          }
        })
      }))
    })
  }

  Promise.all(pickedPromises)
  .then(() => {
    const sourceDataString = stringify(markdown, {
      lazyLoad: themeConfig.lazyLoad,
    })
    callback(
      null,
      'module.exports = {' +
        `\n  markdown: ${sourceDataString},` +
        `\n  picked: ${JSON.stringify(picked, null, 2)},` +
        `\n  plugins: [\n${pluginsString}\n],` +
        '\n};',
    )
  })
}