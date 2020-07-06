#!/usr/bin/env node

const program = require('commander')
const packageInfo = require('../../package.json')

program
  .version(packageInfo.version)
  .command('run [name]', 'run specified task')
  .parse(process.argv)


const subCmd = program.args[0]

if (!subCmd || subCmd !== 'run') {
  program.help()
}
