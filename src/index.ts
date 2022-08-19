import { Command, flags } from "@oclif/command";
import { promisify } from "util";
import fetch from "node-fetch";
import path from "path";
import glob from "glob";
import compareVersions from "compare-versions";
import fs from "fs";
import * as Synvert from "synvert-core";
import dedent from "dedent-js";
import { NodeVM } from "vm2";
const stat = promisify(fs.stat);
const exec = promisify(require("child_process").exec);
const espree = require("@xinminlabs/espree");

type SimpleSnippet = {
  group: string;
  name: string;
};

type Snippet = {
  group: string;
  name: string;
  description: string;
  subSnippets: SimpleSnippet[];
  nodeVersion?: string;
  npmVersion?: {
    name: string;
    version: string;
  };
};

const vm = new NodeVM({ require: { external: true }, eval: false });

class SynvertCommand extends Command {
  private format!: string;
  private load: string = "";

  async run(): Promise<void> {
    const { flags } = this.parse(SynvertCommand);
    if (flags.version) {
      return this.showVersion();
    }
    if (flags.format) {
      this.format = flags.format;
    }
    this.load = flags.load || "";
    if (flags.sync) {
      return await this.syncSnippets();
    }
    if (flags.list) {
      this.readSnippets();
      return this.listSnippets();
    }
    if (flags.show) {
      this.readSnippets();
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
      this.readSnippets();
      return this.runSnippet(flags.run, flags.path, flags.skipFiles);
    }
  }

  showVersion(): void {
    const pjson = require("../package.json");
    console.log(
      `${pjson.version} (with synvert-core ${Synvert.version} and espree ${espree.version})`
    );
  }

  async syncSnippets(): Promise<void> {
    const snippetsHome = this.snippetsHome();
    try {
      await stat(snippetsHome);
      process.chdir(snippetsHome);
      await exec("git checkout .; git pull --rebase");
    } catch {
      await exec(
        `git clone https://github.com/xinminlabs/synvert-snippets-javascript.git ${snippetsHome}`
      );
    }
    this.log("snippets are synced");

    const response = await fetch(
      "https://registry.npmjs.org/synvert-core/latest"
    );
    const json = await response.json();
    if (compareVersions.compare(json.version, Synvert.version, ">")) {
      const { stdout } = await exec("npm root -g");
      await exec(
        `cd ${stdout.trim()}/synvert; npm install synvert-core@${json.version}`
      );
    }
  }

  listSnippets(): void {
    const rewriters = Synvert.Rewriter.rewriters;
    if (this.format === "json") {
      const output: Snippet[] = [];
      Object.keys(rewriters).forEach((group) => {
        Object.keys(rewriters[group]).forEach((name) => {
          const rewriter = rewriters[group][name];
          rewriter.options.runInstance = false;
          rewriter.process();
          const subSnippets = rewriter.subSnippets.map((subSnippt) => ({
            group: subSnippt.group,
            name: subSnippt.name,
          }));
          const item: Snippet = {
            group,
            name,
            description: rewriter.description(),
            subSnippets,
          };
          if (rewriter.nodeVersion) {
            item.nodeVersion = rewriter.nodeVersion.version;
          }
          if (rewriter.npmVersion) {
            item.npmVersion = {
              name: rewriter.npmVersion.name,
              version: rewriter.npmVersion.version,
            };
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

  showSnippet(snippetName: string): void {
    const filePath = path.join(this.snippetsHome(), "lib", `${snippetName}.js`);
    try {
      console.log(fs.readFileSync(filePath, "utf-8"));
    } catch {
      console.log(`snippet ${snippetName} not found`);
    }
  }

  generateSnippet(snippetName: string): void {
    const [group, name] = snippetName.split("/");
    fs.mkdirSync(path.join("lib", group), { recursive: true });
    fs.mkdirSync(path.join("test", group), { recursive: true });
    const libContent = dedent`
      const Synvert = require("synvert-core");

      new Synvert.Rewriter("${group}", "${name}", () => {
        description("convert foo to bar");

        withinFiles(Synvert.ALL_FILES, function () {
          withNode({ type: "ExpressionStatement", expression: { type: "Identifier", name: "foo" } }, () => {
            replaceWith("bar")
          });
        });
      });
    `;
    const testContent = dedent`
      const snippet = "${group}/${name}"
      require(\`../../lib/\${snippet}\`);
      const { assertConvert } = require("../utils");

      describe(snippet, () => {
        const input = \`
          foo
        \`

        const output = \`
          bar
        \`

        assertConvert({
          input,
          output,
          snippet,
        });
      });
    `;
    fs.writeFileSync(path.join("lib", group, name + ".js"), libContent);
    fs.writeFileSync(path.join("test", group, name + ".spec.js"), testContent);
    console.log(`${snippetName} snippet is generated.`);
  }

  runSnippet(snippetName: string, path: string, skipFiles: string): void {
    if (path) Synvert.Configuration.path = path;
    if (skipFiles)
      Synvert.Configuration.skipFiles = skipFiles
        .split(",")
        .map((skipFile) => skipFile.trim());
    console.log(`===== ${snippetName} started =====`);
    const [group, name] = snippetName.split("/");
    Synvert.Rewriter.call(group, name);
    console.log(`===== ${snippetName} done =====`);
  }

  readSnippets() {
    const snippetsHome = this.snippetsHome();
    glob
      .sync(path.join(snippetsHome, "lib/**/*.js"))
      .forEach((filePath) =>
        vm.run(fs.readFileSync(filePath, "utf-8"), "node_modules")
      );
  }

  snippetsHome() {
    return (
      process.env.SYNVERT_SNIPPETS_HOME ||
      path.join(process.env.HOME!, ".synvert-javascript")
    );
  }
}

SynvertCommand.description = `Write javascript code to change javascript code`;

SynvertCommand.flags = {
  // add --help flag to show CLI version
  help: flags.help({ char: "h" }),
  version: flags.boolean({ char: "v" }),
  sync: flags.boolean({ description: "sync snippets" }),
  list: flags.boolean({ char: "l", description: "list snippets" }),
  show: flags.string({
    char: "s",
    description: "show a snippet with snippet name",
  }),
  generate: flags.string({
    char: "g",
    description: "generate a snippet with snippet name",
  }),
  run: flags.string({
    char: "r",
    description: "run a snippet with snippet name",
  }),
  test: flags.string({
    char: "t",
    description: "test a snippet with snippet name",
  }),
  format: flags.string({ char: "f", description: "output format" }),
  load: flags.string({
    char: "d",
    description:
      "load custom snippets, snippet paths can be local file path or remote http url",
  }),
  showRunProcess: flags.boolean({
    default: false,
    description: "show processing files when running a snippet",
  }),
  enableEcmaFeaturesJsx: flags.boolean({
    default: false,
    description: "enable EcmaFeatures jsx",
  }),
  skipFiles: flags.string({
    default: "node_modules/**",
    description: "skip files, splitted by comma",
  }),
  path: flags.string({ default: ".", description: "project path" }),
};

module.exports = SynvertCommand;
