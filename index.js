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
  const watcher = chokidar.watch([
    `${appPath}/Contents/MacOS/*`,
    `${appPath}/Contents/Resources/**`,
  ])
  watcher.once('ready', () =>
    watcher.on('all', () => {
      exec(`kill -9 ${pid}`)

      const appName = fs.readdirSync(`${appPath}/Contents/MacOS`)[0]
      fs.chmodSync(`${appPath}/Contents/MacOS/${appName}`, 0755)

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
