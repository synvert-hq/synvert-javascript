import path from "path";
import { promises as fs } from "fs";
import { promisify } from "util";
import fg from "fast-glob";
import dedent from "dedent-js";
import compareVersions from "compare-versions";
import snakecaseKeys from "snakecase-keys";
import * as Synvert from "synvert-core";

import { groupNameType, Snippet } from "./types";

const exec = promisify(require("child_process").exec);

class Action {
  constructor(private logFunc: (message?: string, ...args: any[]) => void) {}

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
    this.logFunc("snippets are synced");

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

  async readSnippets(): Promise<void> {
    const snippetsHome = this.snippetsHome();
    const paths = await fg(path.join(snippetsHome, "lib/!(helpers)/*.js"));
    await Promise.all(
      paths.map(async (path) => {
        const snippet = await fs.readFile(path, "utf-8");
        eval(Synvert.rewriteSnippetToAsyncVersion(snippet));
      })
    );
  }

  async listSnippets(format: string): Promise<void> {
    const rewriters = Synvert.Rewriter.rewriters;
    if (format === "json") {
      console.log(JSON.stringify(snakecaseKeys(await this.availableSnippets())));
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

  async availableSnippets(): Promise<Snippet[]> {
    const rewriters = Synvert.Rewriter.rewriters;
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
    return groupNames.map(([group, name]) => {
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
      new Synvert.Rewriter("${group}", "${name}", () => {
        description(\`
          convert foo to bar
        \`);

        configure({ parser: Synvert.Parser.TYPESCRIPT });

        withinFiles(Synvert.ALL_FILES, function () {
          findNode(\`.Identifier[escapedText=foo]\`, () => {
            replaceWith("bar");
          });
        });
      });
    `;
    const testContent = dedent`
      const snippet = "${group}/${name}";
      const { assertConvert } = require("../utils");

      describe(snippet, () => {
        const input = \`
          foo
        \`;
        const output = \`
          bar
        \`;

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

  async runSnippet(rewriter: Synvert.Rewriter<any>, format: string): Promise<void> {
    if (format === "json") {
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

  async testSnippet(rewriter: Synvert.Rewriter<any>): Promise<void> {
    const result = await rewriter.test();
    console.log(JSON.stringify(snakecaseKeys(result)));
  }

  private snippetsHome() {
    return (
      process.env.SYNVERT_SNIPPETS_HOME ||
      path.join(process.env.HOME!, ".synvert-javascript")
    );
  }
}

export default Action;