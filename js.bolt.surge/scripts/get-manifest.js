#!usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

if (fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(getManifest()));
}

/**
 * Retrieve a tagged manifest for the environment.
 */
export default function getManifest() {
  const tag = process.env.SLACK_ENVIRONMENT_TAG;
  if (!tag) {
    throw new Error("No environment tag found");
  }
  const pwd = process.env.PWD;
  const manifest = path.join(pwd, `manifest.${tag}.json`);
  if (fs.existsSync(manifest)) {
    const file = fs.readFileSync(manifest, "utf8");
    return JSON.parse(file);
  }
  throw new Error(`No manifest file found for environment: ${tag}`);
}
