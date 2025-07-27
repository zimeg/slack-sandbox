#!/usr/bin/env sh

# Update Node.js engines to the installed version.
#
# Keep this script separate from "scripts" of "package.json" with the different
# runtime version used when making updates.
#
# Note: This script is not used in hooks at this time.

rm -f package-lock.json
npm pkg set --workspace scripts --workspace src engines.node="$(npm version --json | jq -r .node)"
npm update
