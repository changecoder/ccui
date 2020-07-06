const gulp = require('gulp')
const rimraf = require('rimraf')
const ts = require('gulp-typescript')
const babel = require('gulp-babel')
const through2 = require('through2')
const merge2 = require('merge2')

const { getProjectPath } = require('../utils/projectHelper')
const tsConfig = require('../utils/getTSCommonConfig')()
const getBabelCommonConfig = require('../utils/getBabelCommonConfig')
const replaceLib = require('../utils/replaceLib')
const { cssInjection } = require('../utils/styleUtil')
const transformLess = require('../utils/transformLess')

const tsDefaultReporter = ts.reporter.defaultReporter()

const libDir = getProjectPath('lib')
const esDir = getProjectPath('es')

const babelify = (js, modules) => {
  const babelConfig = getBabelCommonConfig(modules)

  delete babelConfig.cacheDirectory

  if (modules === false) {
    babelConfig.plugins.push(replaceLib)
  }

  const stream = js.pipe(babel(babelConfig)).pipe(
    through2.obj(function(file, encoding, next) {
      this.push(file.clone())
      if (file.path.match(/(\/|\\)style(\/|\\)index\.js/)) {
        const content = file.contents.toString(encoding)
        file.contents = Buffer.from(cssInjection(content))
        file.path = file.path.replace(/index\.js/, 'css.js')
        this.push(file)
        next()
      } else {
        next()
      }
    })
  )
  return stream.pipe(gulp.dest(modules === false ? esDir : libDir))
}

const compile = (modules) => {
  rimraf.sync(modules !== false ? libDir : esDir)

  const less = gulp
  .src(['components/**/*.less'])
  .pipe(
    through2.obj(function (file, encoding, next) {
      this.push(file.clone())
      if (
        file.path.match(/(\/|\\)style(\/|\\)index\.less$/) ||
        file.path.match(/(\/|\\)style(\/|\\)v2-compatible-reset\.less$/)
      ) {
        transformLess(file.path)
          .then(css => {
            file.contents = Buffer.from(css)
            file.path = file.path.replace(/\.less$/, '.css')
            this.push(file)
            next()
          })
          .catch(e => {
            console.error(e)
          });
      } else {
        next()
      }
    })
  )
  .pipe(gulp.dest(modules === false ? esDir : libDir))

  const source = [
    'components/**/*.tsx',
    'components/**/*.ts'
  ]

  if (tsConfig.allowJs) {
    source.unshift('components/**/*.jsx')
  }

  const tsResult = gulp.src(source).pipe(
    ts(tsConfig, {
      error(e) {
        tsDefaultReporter.error(e)
        error = 1
      },
      finish: tsDefaultReporter.finish
    })
  )

  const tsFilesStream = babelify(tsResult.js, modules)

  const tsd = tsResult.dts.pipe(gulp.dest(modules === false ? esDir : libDir))

  return merge2([less, tsFilesStream, tsd])
}

module.exports = compile