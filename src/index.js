const {Command, flags} = require('@oclif/command')
const fs = require('fs')
const { promisify } = require('util');
const statAsync = promisify(fs.writeFile)
const path = require('path')
const { exec } = require('child_process')

class SynvertCommand extends Command {
  async run() {
    const {flags} = this.parse(SynvertCommand)
    if (flags.sync) {
      await this.sync()
    }
  }

  async sync() {
    const snippetsHome = this.snippetsHome()
    try {
      await statAsync(snippetsHome)
      process.chdir(snippetsHome)
      await exec('git checkout .; git pull --rebase')
    } catch (err) {
      await exec(`git clone https://github.com/xinminlabs/synvert-snippets.git ${snippetsHome}`)
    }
    this.log('snippets are synced')
  }

  snippetsHome() {
    return process.env.SYNVERT_SNIPPETS_HOME || path.join(process.env.HOME, '.synvert-javascript')
  }
}

SynvertCommand.description = `Write javascript code to change javascript code`

SynvertCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  sync: flags.boolean({ description: 'sync snippets'}),
}

module.exports = SynvertCommand
