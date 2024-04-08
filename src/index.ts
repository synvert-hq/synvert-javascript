import { Command, flags } from "@oclif/command";
import * as Synvert from "synvert-core";
import ts from "typescript";

import {
  syncSnippets,
  readSnippets,
  listSnippets,
  showSnippet,
  generateSnippet,
  runSnippet,
  testSnippet,
} from "./command";

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
      return await syncSnippets();
    }
    if (flags.list) {
      await readSnippets();
      return await listSnippets(this.format);
    }
    if (flags.show) {
      return await showSnippet(flags.show);
    }
    if (flags.generate) {
      return await generateSnippet(flags.generate);
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
    Synvert.Configuration.respectGitignore = !flags["dont-respect-gitignore"];
    Synvert.Configuration.maxFileSize = flags["max-file-size"];
    Synvert.Configuration.singleQuote = flags["single-quote"];
    Synvert.Configuration.semi = !flags["no-semi"];
    Synvert.Configuration.tabWidth = flags["tab-width"];
    if (flags.run) {
      const rewriter = await Synvert.evalSnippet(flags.run);
      await runSnippet(rewriter, this.format);
    }
    if (flags.test) {
      const rewriter = await Synvert.evalSnippet(flags.test);
      await testSnippet(rewriter);
    }
    if (flags.execute) {
      const rewriter = await this.evalSnippetByInput();
      if (flags.execute === "test") {
        await testSnippet(rewriter);
      } else {
        await runSnippet(rewriter, this.format);
      }
      return;
    }
  }

  showVersion(): void {
    const pjson = require("../package.json");
    console.log(
      `${pjson.version} (with synvert-core ${Synvert.version})`,
    );
  }

  private async evalSnippetByInput(): Promise<Synvert.Rewriter<any>> {
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
  "dont-respect-gitignore": flags.boolean({
    default: false,
    description: "do not respect .gitignore",
  }),
  "max-file-size": flags.integer({
    default: 10 * 1024,
    description: "skip file if its size is more than the size",
  }),
  "single-quote": flags.boolean({
    default: false,
    description: "prefer single quote, it uses double quote by default",
  }),
  "no-semi": flags.boolean({
    default: false,
    description: "prefer no semicolon, it prints semicolon by default",
  }),
  "tab-width": flags.integer({
    default: 2,
    description: "prefer tab width",
  }),
};

module.exports = SynvertCommand;
