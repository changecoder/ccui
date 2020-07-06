const path = require('path')

const webpack = require('webpack')
const webpackMerge = require('webpack-merge')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

const { getProjectPath, resolve } = require('../utils/projectHelper'); 

const plugins = require('./plugins')
const rules = require('./rules')

const getConfig = (modules) => {
  const pkg = require(getProjectPath('package.json'))

  const babelConfig = require('../babel/getConfig')(modules || false)
  // babel import for components
  babelConfig.plugins.push([
    resolve('babel-plugin-import'),
    {
      style: true,
      libraryName: pkg.name,
      libraryDirectory: 'components'
    }
  ])

  const config = {
    devtool: 'source-map',

    output: {
      path: getProjectPath('./dist/'),
      filename: '[name].js',
    },

    resolve: {
      modules: ['node_modules', path.join(__dirname, '../node_modules')],
      extensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
      ],
      alias: {
        [pkg.name]: process.cwd(),
      }
    },

    node: [
      'child_process',
      'cluster',
      'dgram',
      'dns',
      'fs',
      'module',
      'net',
      'readline',
      'repl',
      'tls',
    ].reduce(
      (acc, name) => ({
        ...acc,
        [name]: 'empty'
      }),
      {}
    ),

    module: {
      rules: rules(babelConfig)
    },

    plugins
  }

  if (process.env.RUN_ENV === 'PRODUCTION') {
    const entry = ['./index']
    // Common config
    config.externals = {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom'
      }
    }
    config.output.library = pkg.name
    config.output.libraryTarget = 'umd'
    config.optimization = {
      minimizer: [
        new UglifyJsPlugin({
          cache: true,
          parallel: true,
          sourceMap: true,
          uglifyOptions: {
            warnings: false,
          },
        }),
      ],
    }

    // Development
    const uncompressedConfig = webpackMerge({}, config, {
      entry: {
        [pkg.name]: entry,
      },
      mode: 'development',
      plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css',
        }),
      ]
    })

    // Production
    const prodConfig = webpackMerge({}, config, {
      entry: {
        [`${pkg.name}.min`]: entry
      },
      mode: 'production',
      plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new webpack.LoaderOptionsPlugin({
          minimize: true
        }),
        new MiniCssExtractPlugin({
          filename: '[name].css'
        })
      ],
      optimization: {
        minimizer: [new OptimizeCSSAssetsPlugin({})]
      }
    })
    return [prodConfig, uncompressedConfig]
  } 
  return config
}

module.exports = getConfig