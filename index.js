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
  watcher.once('ready', () => {
    watcher.on('all', debounce(onFileChange, 1000))
    function onFileChange() {
      if (pid != null) {
        exec(`kill -9 ${pid}`)
        pid = null
      }
      try {
        pid = open(appPath)
      } catch (e) {
        console.error(e)
      }
    }
  })
}

function open(appPath) {
  const appName = getAppName(appPath)
  fs.chmodSync(`${appPath}/Contents/MacOS/${appName}`, 0755)

  exec(`open ${appPath}`)
  const pid = getProcessId(appPath)
  if (pid == null) {
    throw 'Application failed to open'
  }
  return pid
}

function getAppName(appPath) {
  return fs
    .readdirSync(`${appPath}/Contents/MacOS`)
    .find(name => name[0] !== '.')
}

function getProcesses() {
  return exec('ps x -o pid,args')
    .stdout.split('\n')
    .slice(1)
    .map(proc => {
      const [, pid, args] = /(\d+) (.+)/.exec(proc)
      return { pid, args }
    })
}

function getProcessId(appPath) {
  const appName = getAppName(appPath)
  const appBin = `${appPath}/Contents/MacOS/${appName}`
  const proc = getProcesses().find(proc => proc.args == appBin)
  return proc ? Number(proc.pid) : null
}

function exec(cmd) {
  cmd = cmd.trim().split(/[\s]+/g)
  return execa.sync(cmd[0], cmd.slice(1))
}

function debounce(fn, ms) {
  let t
  return () => {
    clearTimeout(t)
    t = setTimeout(fn, ms)
  }
}
