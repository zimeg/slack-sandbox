#!usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(getManifest()));
}

/**
 * Write source onto target to overwrite existing fields and create anew.
 */
function merge(target, source) {
  Object.keys(source).forEach((key) => {
    if (key in target) {
      if (typeof target[key] === "object" && typeof source[key] === "object") {
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    } else {
      target[key] = source[key];
    }
  });
  return target;
}

/**
 * Read and parse a manifest or throw in attempt.
 */
function readManifest(filename) {
  const pwd = process.env.PWD;
  const manifest = path.join(pwd, `manifest/${filename}`);
  if (fs.existsSync(manifest)) {
    const file = fs.readFileSync(manifest, "utf8");
    return JSON.parse(file);
  }
  throw new Error("No manifest file found");
}

/**
 * Retrieve a tagged manifest or fallback to a default.
 */
export default function getManifest() {
  const tag = process.env.SLACK_ENVIRONMENT_TAG;
  const manifest = readManifest(`manifest.json`);
  if (!tag) {
    return manifest;
  }
  const customizations = readManifest(`manifest.${tag}.json`);
  return merge(manifest, customizations);
}
