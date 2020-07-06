const gulp = require('gulp')
const rimraf = require('rimraf')
const webpack = require('webpack')

const { getProjectPath, getConfig } = require('./utils/projectHelper')
const compile = require('./core/compile')

function dist(done) {
  rimraf.sync(getProjectPath('dist'))
  process.env.RUN_ENV = 'PRODUCTION'
  const webpackConfig = require(getProjectPath('webpack.config.js'))
  webpack(webpackConfig, (err, stats) => {
    if (err) {
      console.error(err.stack || err)
      if (err.details) {
        console.error(err.details)
      }
      return
    }

    const info = stats.toJson()

    if (stats.hasErrors()) {
      console.error(info.errors)
    }

    if (stats.hasWarnings()) {
      console.warn(info.warnings)
    }

    const buildInfo = stats.toString({
      colors: true,
      children: true,
      chunks: false,
      modules: false,
      chunkModules: false,
      hash: false,
      version: false,
    })

    console.log(buildInfo)

    // Additional process of dist finalize
    const { dist: { finalize } = {} } = getConfig()
    if (finalize) {
      console.log('[Dist] Finalization...')
      finalize()
    }

    done(0)
  })
}

gulp.task('compile-with-es', done => {
  console.log('[Parallel] Compile to es...')
  compile(false).on('finish', done)
})

gulp.task('compile-with-lib', done => {
  console.log('[Parallel] Compile to js...')
  compile().on('finish', done)
})

gulp.task('compile-finalize', done => {
  console.log('[Compile] Finalization...')
  done()
})

gulp.task(
  'compile',
  gulp.series(gulp.parallel('compile-with-es', 'compile-with-lib'), 'compile-finalize')
)

gulp.task(
  'dist',
  gulp.series(done => {
    dist(done)
  })
)