const { resolve, dirname } = require('path')
const { readFileSync } = require('fs')

const less = require('less')
const postcss = require('postcss')

const postcssConfig = require('../postcssConfig')

const transformLess = (lessFile, config = {}) => {
  const { cwd = process.cwd() } = config

  const resolvedLessFile = resolve(cwd, lessFile)

  let data = readFileSync(resolvedLessFile, 'utf-8')

  data = data.replace(/^\uFEFF/, '')

  const lessOpts = {
    paths: [dirname(resolvedLessFile)],
    filename: resolvedLessFile,
    javascriptEnabled: true
  }

  return less
    .render(data, lessOpts)
    .then(result => postcss(postcssConfig.plugins).process(result.css, { from: undefined }))
    .then(r => r.css)
}

module.exports = transformLess