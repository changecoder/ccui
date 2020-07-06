const fs = require('fs')
const path = require('path')

const cwd = process.cwd()

function getProjectPath(...filePath) {
  return path.join(cwd, ...filePath)
}

const getConfig = () => {
  const configPath = getProjectPath('.ccui-tools.config.js')
  if (fs.existsSync(configPath)) {
    return require(configPath)
  }

  return {}
}

const resolve = (moduleName) => require.resolve(moduleName)

module.exports = {
  getProjectPath,
  getConfig,
  resolve
}