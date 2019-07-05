const chokidar = require('chokidar')
const execa = require('execa')
const path = require('path')
const fs = require('fs')

module.exports = appPath => {
  if (!appPath.endsWith('.app')) {
    throw 'Application path must end with .app'
  }
  appPath = path.resolve(appPath.replace(/^~/, process.env.HOME))
  if (!fs.existsSync(appPath)) {
    throw 'Application not found'
  }
  let pid = getProcessId(appPath)
  if (pid == null) {
    pid = open(appPath)
  }
  const execDir = `${appPath}/Contents/MacOS`
  const execName = fs.readdirSync(execDir).filter(p => p[0] !== '.')[0]
  const watcher = chokidar.watch([
    path.join(execDir, execName),
    `${appPath}/Contents/Resources/main.jsbundle`,
  ])
  watcher.once('ready', () =>
    watcher.on('all', () => {
      exec(`kill -9 ${pid}`)
      pid = open(appPath)
    })
  )
}

function open(appPath) {
  exec(`open ${appPath}`)
  const pid = getProcessId(appPath)
  if (pid == null) {
    throw 'Application failed to open'
  }
  return pid
}

function getProcessId(appPath) {
  const pidBin = path.resolve(__dirname, 'pid.sh')
  const pidStr = exec(`sh ${pidBin} ${appPath}`).stdout
  return pidStr ? Number(pidStr) : null
}

function exec(cmd) {
  cmd = cmd.trim().split(/[\s]+/g)
  return execa.sync(cmd[0], cmd.slice(1))
}