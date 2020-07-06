const req = require.context('./components', true, /^\.\/[^_][\w-]+\/style\/index\.tsx?$/)

req.keys().forEach(mod => {
  let v = req(mod)

  if (v && v.default) {
    v = v.default
  }

  const match = mod.match(/^\.\/([^_][\w-]+)\/index\.tsx?$/)

  if (match && match[1]) {
    exports[camelCase(match[1])] = v
  }
})

module.exports = require('./components')