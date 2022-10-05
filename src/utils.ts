import fs from "fs";
import { URL } from "url";

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

export const formatUrl = (url: string): string => {
  return convertToGithubRawUrl(url);
};

const convertToGithubRawUrl = (url: string): string => {
  if (!url.includes("//github.com/")) {
    return url;
  }
  return url
    .replace("//github.com/", "//raw.githubusercontent.com/")
    .replace("/blob/", "/");
};