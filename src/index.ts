import { Command, flags } from "@oclif/command";
import { promisify } from "util";
import fetch from "node-fetch";
import path from "path";
import fg from "fast-glob";
import compareVersions from "compare-versions";
import { promises as fs } from "fs";
import * as Synvert from "synvert-core";
import ts from "typescript";
import dedent from "dedent-js";
import snakecaseKeys from "snakecase-keys";
const exec = promisify(require("child_process").exec);
const espree = require("@xinminlabs/espree");

type groupNameType = [string, string];

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
      await this.readSnippets();
      return await this.listSnippets();
    }
    if (flags.show) {
      return await this.showSnippet(flags.show);
    }
    if (flags.generate) {
      return await this.generateSnippet(flags.generate);
    }
    if (flags["show-run-process"]) {
      Synvert.Configuration.showRunProcess = true;
    }
    if (flags["root-path"]) {
      Synvert.Configuration.rootPath = flags["root-path"];
    }
    if (flags["only-paths"]) {
      Synvert.Configuration.onlyPaths = flags["only-paths"]
        .split(",")
        .map((onlyPath: string) => onlyPath.trim());
    }
    if (flags["skip-paths"]) {
      Synvert.Configuration.skipPaths = flags["skip-paths"]
        .split(",")
        .map((skipPath: string) => skipPath.trim());
    }
    if (flags["max-file-size"]) {
      Synvert.Configuration.maxFileSize = flags["max-file-size"];
    }
    Synvert.Configuration.singleQuote = flags["single-quote"];
    if (flags.run) {
      const rewriter = await Synvert.evalSnippet(flags.run);
      await this.runSnippet(rewriter);
    }
    if (flags.test) {
      const rewriter = await Synvert.evalSnippet(flags.test);
      await this.testSnippet(rewriter);
    }
    if (flags.execute) {
      const rewriter = await this.evalSnippetByInput();
      if (flags.execute === "test") {
        await this.testSnippet(rewriter);
      } else {
        await this.runSnippet(rewriter);
      }
      return;
    }
  }

  showVersion(): void {
    const pjson = require("../package.json");
    console.log(
      `${pjson.version} (with synvert-core ${Synvert.version} and espree ${espree.version} and typescript ${ts.version})`
    );
  }

  async syncSnippets(): Promise<void> {
    const snippetsHome = this.snippetsHome();
    try {
      await fs.stat(snippetsHome);
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

  async listSnippets(): Promise<void> {
    const rewriters = Synvert.Rewriter.rewriters;
    if (this.format === "json") {
      const groupNames: groupNameType[] = [];
      Object.keys(rewriters).map((group) => {
        Object.keys(rewriters[group]).map((name) => {
          groupNames.push([group, name]);
        });
      });
      await Promise.all(
        groupNames.map(([group, name]) => {
          const rewriter = rewriters[group][name];
          return rewriter.processWithSandbox();
        })
      );
      const snippets = groupNames.map(([group, name]) => {
        const rewriter = rewriters[group][name];
        const subSnippets = rewriter.subSnippets.map((subSnippt) => ({
          group: subSnippt.group,
          name: subSnippt.name,
        }));
        const snippet: Snippet = {
          group,
          name,
          description: rewriter.description(),
          subSnippets,
        };
        if (rewriter.nodeVersion) {
          snippet.nodeVersion = rewriter.nodeVersion.version;
        }
        if (rewriter.npmVersion) {
          snippet.npmVersion = {
            name: rewriter.npmVersion.name,
            version: rewriter.npmVersion.version,
          };
        }
        return snippet;
      });
      console.log(JSON.stringify(snakecaseKeys(snippets)));
    } else {
      if (Object.keys(rewriters).length === 0) {
        console.log(
          `There is no snippet under ${this.snippetsHome()}, please run \`synvert-javascript --sync\` to fetch snippets.`
        );
      }
      Object.keys(rewriters).forEach((group) => {
        console.log(group);
        Object.keys(rewriters[group]).forEach((name) => {
          console.log(`    ${name}`);
        });
      });
    }
  }

  async showSnippet(snippetName: string): Promise<void> {
    const filePath = path.join(this.snippetsHome(), "lib", `${snippetName}.js`);
    try {
      console.log(await fs.readFile(filePath, "utf-8"));
    } catch {
      console.log(`snippet ${snippetName} not found`);
    }
  }

  async generateSnippet(snippetName: string): Promise<void> {
    const [group, name] = snippetName.split("/");
    await fs.mkdir(path.join("lib", group), { recursive: true });
    await fs.mkdir(path.join("test", group), { recursive: true });
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
    await fs.writeFile(path.join("lib", group, name + ".js"), libContent);
    await fs.writeFile(
      path.join("test", group, name + ".spec.js"),
      testContent
    );
    console.log(`${snippetName} snippet is generated.`);
  }

  private async evalSnippetByInput(): Promise<Synvert.Rewriter> {
    const snippet: string = await new Promise((resolve) => {
      let input = "";
      process.stdin.on("data", (data) => {
        input += data;
      });
      process.stdin.on("end", () => {
        resolve(input.toString());
      });
    });
    return eval(Synvert.rewriteSnippetToAsyncVersion(snippet));
  }

  private async runSnippet(rewriter: Synvert.Rewriter): Promise<void> {
    if (this.format === "json") {
      await rewriter.process();
      const affectedFiles = rewriter.affectedFiles;
      rewriter.subSnippets.forEach((subSnippet) => {
        subSnippet.affectedFiles.forEach((filePath) => {
          affectedFiles.add(filePath);
        });
      });
      const output = { affected_files: [...affectedFiles] };
      console.log(JSON.stringify(output));
    } else {
      console.log(`===== ${rewriter.group}/${rewriter.name} started =====`);
      await rewriter.process();
      console.log(`===== ${rewriter.group}/${rewriter.name} done =====`);
    }
  }

  private async testSnippet(rewriter: Synvert.Rewriter): Promise<void> {
    const result = await rewriter.test();
    console.log(JSON.stringify(snakecaseKeys(result)));
  }

  private async readSnippets(): Promise<void> {
    const snippetsHome = this.snippetsHome();
    const paths = await fg(path.join(snippetsHome, "lib/!(helpers)/*.js"));
    await Promise.all(
      paths.map(async (path) => {
        const snippet = await fs.readFile(path, "utf-8");
        eval(Synvert.rewriteSnippetToAsyncVersion(snippet));
      })
    );
  }

  private snippetsHome() {
    return (
      process.env.SYNVERT_SNIPPETS_HOME ||
      path.join(process.env.HOME!, ".synvert-javascript")
    );
  }
}

SynvertCommand.description = `Write javascript code to rewrite javascript code`;

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
  "show-run-process": flags.boolean({
    default: false,
    description: "show processing files when running a snippet",
  }),
  "only-paths": flags.string({
    default: "",
    description: "only paths, splitted by comma",
  }),
  "skip-paths": flags.string({
    default: "**/node_modules/**",
    description: "skip paths, splitted by comma",
  }),
  "root-path": flags.string({ default: ".", description: "project root path" }),
  "max-file-size": flags.integer({
    default: 10 * 1024,
    description: "skip file if its size is more than the size",
  }),
  "single-quote": flags.boolean({
    default: false,
    description: "prefer single quote, it uses double quote by default",
  }),
};

module.exports = SynvertCommand;
