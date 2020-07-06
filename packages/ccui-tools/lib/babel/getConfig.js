const babelConfig = require('./.babelrc')

module.exports = (modules) => {
  const presetEnvSet = babelConfig.presets[1]
  const presetEnvConfig = presetEnvSet[1]
  Object.assign(presetEnvConfig, { modules })
  return babelConfig
}