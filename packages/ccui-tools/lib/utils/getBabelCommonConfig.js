const { resolve } = require('./projectHelper')

module.exports = function (modules) {
  return {
    presets: [
      resolve('@babel/preset-react'),
      [
        resolve('@babel/preset-env'),
        {
          modules,
          targets: {
            browsers: [
              'last 2 versions',
              'Firefox ESR',
              '> 1%',
              'ie >= 9',
              'iOS >= 8',
              'Android >= 4'
            ]
          }
        }
      ]
    ],
    plugins: []
  }
}
