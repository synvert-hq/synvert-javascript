import { Command, flags } from "@oclif/command";
import { promisify } from "util";
import fetch from "node-fetch";
import path from "path";
import glob from "glob";
import compareVersions from "compare-versions";
import fs from "fs";
import * as Synvert from "synvert-core";
import ts from "typescript";
import dedent from "dedent-js";
import snakecaseKeys from "snakecase-keys";
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

class SynvertCommand extends Command {
  private format!: string;

  async run(): Promise<void> {
    const { flags } = this.parse(SynvertCommand);
    if (flags.version) {
      return this.showVersion();
    }
    if (flags.format) {
      this.format = flags.format;
    }
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
    if (flags.rootPath) {
      Synvert.Configuration.rootPath = flags.rootPath;
    }
    if (flags.onlyPaths) {
      Synvert.Configuration.onlyPaths = flags.onlyPaths
        .split(",")
        .map((onlyPath: string) => onlyPath.trim());
    }
    if (flags.skipPaths) {
      Synvert.Configuration.skipPaths = flags.skipPaths
        .split(",")
        .map((skipPath: string) => skipPath.trim());
    }
    if (flags.run) {
      this.readSnippets();
      const rewriter = await Synvert.evalSnippet(flags.run);
      this.runSnippet(rewriter);
    }
    if (flags.test) {
      this.readSnippets();
      const rewriter = await Synvert.evalSnippet(flags.test);
      this.testSnippet(rewriter);
    }
    if (flags.execute) {
      this.readSnippets();
      process.stdin.on("data", (data) => {
        if (flags.execute === "test") {
          const rewriter = this.evalSnippetByInput(data.toString());
          this.testSnippet(rewriter);
        } else {
          const rewriter = this.evalSnippetByInput(data.toString());
          this.runSnippet(rewriter);
        }
        process.exit();
      });
      return;
    }
  }

  showVersion(): void {
    const pjson = require("../package.json");
    console.log(
      `${pjson.version} (with synvert-core ${Synvert.version} and espree ${espree.version}) and typescript ${ts.version}`
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
          rewriter.processWithSandbox();
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
      console.log(JSON.stringify(snakecaseKeys(output)));
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

  evalSnippetByInput(input: string): Synvert.Rewriter {
    return eval(input);
  }

  private runSnippet(rewriter: Synvert.Rewriter): void {
    console.log(`===== ${rewriter.group}/${rewriter.name} started =====`);
    rewriter.process();
    console.log(`===== ${rewriter.group}/${rewriter.name} done =====`);
  }

  private testSnippet(rewriter: Synvert.Rewriter): void {
    const result = rewriter.test();
    console.log(JSON.stringify(snakecaseKeys(result)));
  }

  private readSnippets() {
    const snippetsHome = this.snippetsHome();
    glob
      .sync(path.join(snippetsHome, "lib/**/*.js"))
      .forEach((filePath) => eval(fs.readFileSync(filePath, "utf-8")));
  }

  private snippetsHome() {
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
    description:
      "run a snippet with snippet name, or local file path, or remote http url",
  }),
  execute: flags.string({
    char: "e",
    description: "execute a snippet, run or test",
  }),
  test: flags.string({
    char: "t",
    description:
      "test a snippet with snippet name, or local file path, or remote http url",
  }),
  format: flags.string({ char: "f", description: "output format" }),
  showRunProcess: flags.boolean({
    default: false,
    description: "show processing files when running a snippet",
  }),
  onlyPaths: flags.string({
    default: "",
    description: "only paths, splitted by comma",
  }),
  skipPaths: flags.string({
    default: "**/node_modules/**",
    description: "skip paths, splitted by comma",
  }),
  rootPath: flags.string({ default: ".", description: "project root path" }),
};

module.exports = SynvertCommand;
