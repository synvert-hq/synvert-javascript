const { Command, flags } = require("@oclif/command");
const { promisify } = require("util");
const path = require("path");
const glob = require("glob");
const fs = require("fs");
const stat = promisify(fs.stat);
const exec = promisify(require("child_process").exec);
const Synvert = require("synvert-core");

class SynvertCommand extends Command {
  async run() {
    const { flags } = this.parse(SynvertCommand);
    if (flags.sync) {
      return await this.syncSnippets();
    }
    if (flags.list) {
      this.loadSnippets();
      return this.listSnippets();
    }
    if (flags.show) {
      this.loadSnippets();
      return this.showSnippet(flags.show);
    }
    if (flags.showRunProcess) {
      Synvert.Configuration.showRunProcess = true;
    }
    if (flags.enableEcmaFeaturesJsx) {
      Synvert.Configuration.enableEcmaFeaturesJsx = true;
    }
    if (flags.run) {
      this.loadSnippets();
      return this.runSnippet(flags.run, flags.path, flags.skipFiles);
    }
  }

  async syncSnippets() {
    const snippetsHome = this.snippetsHome();
    try {
      await stat(snippetsHome);
      process.chdir(snippetsHome);
      await exec("git checkout .; git pull --rebase");
    } catch (error) {
      await exec(`git clone https://github.com/xinminlabs/synvert-snippets-javascript.git ${snippetsHome}`);
    }
    this.log("snippets are synced");
  }

  listSnippets() {
    const rewriters = Synvert.Rewriter.rewriters;
    Object.keys(rewriters).forEach((group) => {
      console.log(group);
      Object.keys(rewriters[group]).forEach((name) => {
        console.log(`    ${name}`);
      });
    });
  }

  showSnippet(snippetName) {
    const filePath = path.join(this.snippetsHome(), "lib", `${snippetName}.js`);
    try {
      console.log(fs.readFileSync(filePath, "utf-8"));
    } catch {
      console.log(`snippet ${snippetName} not found`);
    }
  }

  runSnippet(snippetName, path, skipFiles) {
    if (path) Synvert.Configuration.path = path;
    if (skipFiles) Synvert.Configuration.skipFiles = skipFiles.split(",").map((skipFile) => skipFile.trim());
    console.log(`===== ${snippetName} started =====`);
    const [group, name] = snippetName.split("/");
    Synvert.Rewriter.call(group, name);
    console.log(`===== ${snippetName} done =====`);
  }

  loadSnippets() {
    const snippetsHome = this.snippetsHome();
    glob.sync(path.join(snippetsHome, "lib/**/*.js")).forEach((filePath) => eval(fs.readFileSync(filePath, "utf-8")));
  }

  snippetsHome() {
    return process.env.SYNVERT_SNIPPETS_HOME || path.join(process.env.HOME, ".synvert-javascript");
  }
}

SynvertCommand.description = `Write javascript code to change javascript code`;

SynvertCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({ char: "v" }),
  // add --help flag to show CLI version
  help: flags.help({ char: "h" }),
  sync: flags.boolean({ description: "sync snippets" }),
  list: flags.boolean({ char: "l", description: "list snippets" }),
  show: flags.string({ char: "s", description: "show a snippet with snippet name" }),
  run: flags.string({ char: "r", description: "run a snippet with snippet name" }),
  showRunProcess: flags.boolean({ default: false, description: "show processing files when running a snippet" }),
  enableEcmaFeaturesJsx: flags.boolean({ default: false, description: "enable EcmaFeatures jsx" }),
  skipFiles: flags.string({ default: "node_modules/**", description: "skip files, splitted by comma" }),
  path: flags.string({ default: ".", description: "project path" }),
};

module.exports = SynvertCommand;
