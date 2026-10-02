import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

if (!existsSync(".git")) {
  process.stdout.write(
    "prepare: no Git checkout detected; skipping local hook setup.\n",
  );
  process.exit(0);
}

const result = spawnSync("git", ["config", "core.hooksPath", ".githooks"], {
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
