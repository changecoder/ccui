const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const postcssConfig = require('./postcssConfig')
const { resolve } = require('../utils/projectHelper')

const svgRegex = /\.svg(\?v=\d+\.\d+\.\d+)?$/
const svgOptions = {
  limit: 10000,
  minetype: 'image/svg+xml'
}
const imageOptions = {
  limit: 10000
}

module.exports = (babelConfig) => [
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    loader: resolve('babel-loader'),
    options: babelConfig
  },
  {
    test: /\.tsx?$/,
    use: [
      {
        loader: resolve('babel-loader'),
        options: babelConfig,
      },
      {
        loader: resolve('ts-loader'),
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          ...postcssConfig,
          sourceMap: true,
        }
      }
    ]
  },
  {
    test: /\.less$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          sourceMap: true
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          ...postcssConfig,
          sourceMap: true
        }
      },
      {
        loader: resolve('less-loader'),
        options: {
          lessOptions: {
            javascriptEnabled: true
          },
          sourceMap: true
        }
      }
    ]
  },
  // Images
  {
    test: svgRegex,
    loader: 'url-loader',
    options: svgOptions,
  },
  {
    test: /\.(png|jpg|jpeg|gif)(\?v=\d+\.\d+\.\d+)?$/i,
    loader: 'url-loader',
    options: imageOptions,
  }
]