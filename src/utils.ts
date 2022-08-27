import fs from "fs";
import { URL } from "url";
import { NodeVM } from "vm2";
import { Rewriter } from "synvert-core";

const vm = new NodeVM({
  sandbox: global,
  require: { external: true },
  eval: false,
});

export const runInVm = (script: string): void => {
  vm.run(script, "./vm.js");
};

export const getLastSnippetGroupAndName = (): [string, string] => {
  const group = Object.keys(Rewriter.rewriters)[0];
  const name = Object.keys(Rewriter.rewriters[group])[0];
  return [group, name];
};

export const isValidUrl = (urlString: string): boolean => {
  try {
    const url = new URL(urlString);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const isValidFile = (path: string): boolean => {
  try {
    const stats = fs.statSync(path);
    return stats.isFile();
  } catch {
    return false;
  }
};
