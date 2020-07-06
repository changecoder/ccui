const { resolve } = require('../utils/projectHelper')

module.exports = {
  presets: [
    resolve('@babel/preset-react'),
    [
      resolve('@babel/preset-env'),
      {
        targets: {
          browsers: [
            'last 2 versions',
            'Firefox ESR',
            '> 1%',
            'ie >= 9',
            'iOS >= 8',
            'Android >= 4',
          ]
        }
      }
    ]
  ],
  plugins: []
}