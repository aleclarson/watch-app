#!/usr/bin/env node
try {
  const appPath = process.argv[2]
  if (appPath) {
    require('.')(appPath)
    console.log('👀  Watching...')
  } else {
    fatal('Must provide an application path')
  }
} catch (err) {
  fatal(err)
}
function fatal(err) {
  const { red } = require('kleur')
  console.error(red('error:'), err.stack || err)
  process.exit(1)
}
