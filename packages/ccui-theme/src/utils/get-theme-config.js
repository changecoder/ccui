export default function getThemeConfig(configFile) {
  const customizedConfig = require(configFile)
  
  const config = Object.assign({ plugins: [] }, customizedConfig)

  return config
}