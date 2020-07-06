#!/usr/bin/env node

const gulp = require('gulp')
const program = require('commander')

program.on('--help', () => {
  console.log()
})

program.parse(process.argv)

function runTask(toRun) {
  const taskInstance = gulp.task(toRun)

  if (taskInstance === undefined) {
    console.log('task_not_found', task)
    return
  }

  try {
    taskInstance.apply(gulp)
  } catch (err) {
    gulp.emit('task_err', err)
  }
}

const task = program.args[0]

if (!task) {
  program.help()
} else {
  console.log('ccui-tools run', task)

  require('../gulpfile')

  runTask(task)
}
