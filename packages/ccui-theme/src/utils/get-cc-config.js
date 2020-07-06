import * as path from 'path'
import * as fs from 'fs'
import * as resolve from 'resolve'
import rucksack from 'rucksack-css';
import autoprefixer from 'autoprefixer'

const markdownTransformer = path.join(__dirname, '..', 'transformers', 'markdown')

const defaultConfig = {
  port: 8000,
  source: './posts',
  output: './_site',
  theme: './_theme',
  htmlTemplate: path.join(__dirname, '../template.html'),
  transformers: [],
  devServerConfig: {},
  postcssConfig: {
    plugins: [
      rucksack(),
      autoprefixer(),
    ],
  },
  webpackConfig(config) {
    return config
  },
  entryName: 'index',
  root: '/'
}

export default function getCcConfig(configFile) {
  const customizedConfig = fs.existsSync(configFile) ? require(configFile) : {}

  const config = Object.assign({}, defaultConfig, customizedConfig)

  config.theme = resolve.sync(config.theme, { basedir: process.cwd() })

  config.transformers = config.transformers.concat({
    test: /\.md$/,
    use: markdownTransformer,
  }).map(({ test, use }) => ({
    test: test.toString(),
    use,
  }))

  return config
}