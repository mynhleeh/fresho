#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  mkdirSync,
  statSync,
  copyFileSync,
} from "node:fs";
import { join } from "node:path";

const CACHE_FILE = join(".cache", "setup-state.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

function hashFileContent(path) {
  return createHash("sha1").update(readFileSync(path)).digest("hex");
}

function listFilesRecursive(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFilesRecursive(path));
    else files.push(path);
  }
  return files.sort();
}

function hashDependencyFiles() {
  const parts = [];
  if (existsSync("package-lock.json")) parts.push(hashFileContent("package-lock.json"));
  if (existsSync("package.json")) parts.push(hashFileContent("package.json"));
  return createHash("sha1").update(parts.join("|")).digest("hex");
}

function hashPrismaFiles() {
  if (!existsSync("prisma")) return "";
  const parts = listFilesRecursive("prisma")
    .filter((path) => statSync(path).isFile())
    .map((path) => `${path}:${hashFileContent(path)}`);
  return createHash("sha1").update(parts.join("|")).digest("hex");
}

function loadPreviousSetupState() {
  if (!existsSync(CACHE_FILE)) return null;
  try {
    return JSON.parse(readFileSync(CACHE_FILE, "utf8"));
  } catch {
    return null;
  }
}

function saveSetupState(state) {
  mkdirSync(".cache", { recursive: true });
  writeFileSync(CACHE_FILE, JSON.stringify(state, null, 2));
}

function buildChildEnv() {
  return Object.fromEntries(
    Object.entries(process.env).filter(([key]) => !key.toLowerCase().startsWith("npm_config_")),
  );
}

function runChildCommand(command, args, env) {
  return spawnSync(command, args, { stdio: "inherit", shell: true, env }).status;
}

function installDependencies(env) {
  console.log("Installing dependencies...");
  if (runChildCommand("npm", ["install"], env) !== 0) fail("npm install failed.");
}

function migratePrisma(env) {
  console.log("Applying Prisma migrations...");
  if (runChildCommand("npx", ["prisma", "migrate", "dev"], env) !== 0) fail("prisma migrate dev failed.");
}

function ensureEnvFile() {
  if (!existsSync(".env") && existsSync(".env.example")) {
    console.log("Creating .env from .env.example...");
    copyFileSync(".env.example", ".env");
  }
}

function startDevServer(env) {
  console.log("Starting dev server...");
  runChildCommand("npx", ["next", "dev"], env);
}

const childEnv = buildChildEnv();
const previousState = loadPreviousSetupState();
const currentState = {
  dependencies: hashDependencyFiles(),
  prisma: hashPrismaFiles(),
};

const dependenciesChanged =
  !existsSync("node_modules") || previousState?.dependencies !== currentState.dependencies;
const prismaChanged = previousState?.prisma !== currentState.prisma;

if (dependenciesChanged) installDependencies(childEnv);
if (prismaChanged) migratePrisma(childEnv);
ensureEnvFile();
saveSetupState(currentState);
startDevServer(childEnv);
