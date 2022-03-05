const { Command, flags } = require("@oclif/command");
const { promisify } = require("util");
const fetch = require("node-fetch");
const path = require("path");
const glob = require("glob");
const compareVersions = require("compare-versions");
const fs = require("fs");
const stat = promisify(fs.stat);
const exec = promisify(require("child_process").exec);
const Synvert = require("synvert-core");
const espree = require("xinminlabs-espree");
const dedent = require("dedent-js");

class SynvertCommand extends Command {
  async run() {
    const { flags } = this.parse(SynvertCommand);
    if (flags.version) {
      return this.showVersion();
    }
    if (flags.format) {
      this.format = flags.format;
    }
    this.load = flags.load || '';
    if (flags.sync) {
      return await this.syncSnippets();
    }
    if (flags.list) {
      await this.loadSnippets();
      return this.listSnippets();
    }
    if (flags.show) {
      await this.loadSnippets();
      return this.showSnippet(flags.show);
    }
    if (flags.generate) {
      return this.generateSnippet(flags.generate);
    }
    if (flags.showRunProcess) {
      Synvert.Configuration.showRunProcess = true;
    }
    if (flags.enableEcmaFeaturesJsx) {
      Synvert.Configuration.enableEcmaFeaturesJsx = true;
    }
    if (flags.run) {
      await this.loadSnippets();
      return this.runSnippet(flags.run, flags.path, flags.skipFiles);
    }
  }

  showVersion() {
    const pjson = require("../package.json");
    console.log(`${pjson.version} (with synvert-core ${Synvert.version} and espree ${espree.version})`);
  }

  async syncSnippets() {
    const snippetsHome = this.snippetsHome();
    try {
      await stat(snippetsHome);
      process.chdir(snippetsHome);
      await exec("git checkout .; git pull --rebase");
    } catch {
      await exec(`git clone https://github.com/xinminlabs/synvert-snippets-javascript.git ${snippetsHome}`);
    }
    this.log("snippets are synced");

    const response = await fetch("https://registry.npmjs.org/synvert-core/latest");
    const json = await response.json();
    if (compareVersions.compare(json.version, Synvert.version, ">")) {
      const { stdout } = await exec("npm root -g");
      await exec(`cd ${stdout.trim()}/synvert; npm install synvert-core@${json.version}`);
    }
  }

  listSnippets() {
    const rewriters = Synvert.Rewriter.rewriters;
    if (this.format === "json") {
      const output = [];
      Object.keys(rewriters).forEach((group) => {
        Object.keys(rewriters[group]).forEach((name) => {
          const rewriter = rewriters[group][name];
          rewriter.processWithSandbox();
          const subSnippets = rewriter.subSnippets.map((subSnippt) => ({
            group: subSnippt.group,
            name: subSnippt.name,
          }));
          const item = { group, name, description: rewriter.description(), subSnippets };
          if (rewriter.nodeVersion) {
            item.nodeVersion = rewriter.nodeVersion.version;
          }
          if (rewriter.npmVersion) {
            item.npmVersion = { name: rewriter.npmVersion.name, version: rewriter.npmVersion.version };
          }
          output.push(item);
        });
      });
      console.log(JSON.stringify(output));
    } else {
      Object.keys(rewriters).forEach((group) => {
        console.log(group);
        Object.keys(rewriters[group]).forEach((name) => {
          console.log(`    ${name}`);
        });
      });
    }
  }

  showSnippet(snippetName) {
    const filePath = path.join(this.snippetsHome(), "lib", `${snippetName}.js`);
    try {
      console.log(fs.readFileSync(filePath, "utf-8"));
    } catch {
      console.log(`snippet ${snippetName} not found`);
    }
  }

  generateSnippet(snippetName) {
    const [group, name] = snippetName.split("/");
    fs.mkdirSync(path.join("lib", group), { recursive: true });
    fs.mkdirSync(path.join("test", group), { recursive: true });
    const libContent = dedent`
      const Synvert = require("synvert-core");

      new Synvert.Rewriter("${group}", "${name}", () => {
        description("convert foo to bar");

        withinFiles("**/*.js", () => {
          withNode({ type: "ExpressionStatement", expression: { type: "Identifier", name: "foo" } }, () => {
            replaceWith("bar")
          });
        });
      });
    `;
    const testContent = dedent`
      require("../../lib/${group}/${name}");
      const { assertConvert } = require("../utils");

      describe("${group}/${name}", () => {
        assertConvert({
          input: "foo",
          output: "bar",
          snippet: "${group}/${name}",
        });
      });
    `;
    fs.writeFileSync(path.join("lib", group, name + ".js"), libContent);
    fs.writeFileSync(path.join("test", group, name + ".spec.js"), testContent);
    console.log(`${snippetName} snippet is generated.`)
  }

  runSnippet(snippetName, path, skipFiles) {
    if (path) Synvert.Configuration.path = path;
    if (skipFiles) Synvert.Configuration.skipFiles = skipFiles.split(",").map((skipFile) => skipFile.trim());
    console.log(`===== ${snippetName} started =====`);
    const [group, name] = snippetName.split("/");
    Synvert.Rewriter.call(group, name);
    console.log(`===== ${snippetName} done =====`);
  }

  async loadSnippets() {
    const snippetsHome = this.snippetsHome();
    glob.sync(path.join(snippetsHome, "lib/**/*.js")).forEach((filePath) => eval(fs.readFileSync(filePath, "utf-8")));

    await Promise.all(this.load.split(',').map(async (loadPath) => {
      if (loadPath === '') return;

      if (loadPath.startsWith('http')) {
        const response = await fetch(loadPath);
        eval(await response.text());
      } else {
        eval(fs.readFileSync(loadPath, "utf-8"));
      }
    }));
  }

  snippetsHome() {
    return process.env.SYNVERT_SNIPPETS_HOME || path.join(process.env.HOME, ".synvert-javascript");
  }
}

SynvertCommand.description = `Write javascript code to change javascript code`;

SynvertCommand.flags = {
  // add --help flag to show CLI version
  help: flags.help({ char: "h" }),
  version: flags.boolean({ char: "v" }),
  sync: flags.boolean({ description: "sync snippets" }),
  list: flags.boolean({ char: "l", description: "list snippets" }),
  show: flags.string({ char: "s", description: "show a snippet with snippet name" }),
  generate: flags.string({ char: "g", description: "generate a snippet with snippet name" }),
  run: flags.string({ char: "r", description: "run a snippet with snippet name" }),
  format: flags.string({ char: "f", description: "output format" }),
  load: flags.string({ char: "d", description: "load custom snippets, snippet paths can be local file path or remote http url" }),
  showRunProcess: flags.boolean({ default: false, description: "show processing files when running a snippet" }),
  enableEcmaFeaturesJsx: flags.boolean({ default: false, description: "enable EcmaFeatures jsx" }),
  skipFiles: flags.string({ default: "node_modules/**", description: "skip files, splitted by comma" }),
  path: flags.string({ default: ".", description: "project path" }),
};

module.exports = SynvertCommand;
