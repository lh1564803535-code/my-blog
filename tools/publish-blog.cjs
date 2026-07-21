const { spawnSync, spawn } = require("child_process");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
    ...options,
  });
}

function capture(command, args) {
  return spawnSync(command, args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  });
}

function commitMessage() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `publish: ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function openSite() {
  spawn("cmd", ["/c", "start", "", "https://lh1564803535-code.github.io/my-blog/"], {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore",
  }).unref();
}

console.log("");
console.log("=== 发布博客 ===");
console.log("");

const statusBefore = capture("git", ["status", "--porcelain"]);
if (!statusBefore.stdout.trim()) {
  console.log("没有检测到改动，不需要发布。");
  process.exit(0);
}

console.log("1/4 构建站点...");
let result = run(npmCommand, ["run", "build"]);
if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log("2/4 暂存改动...");
result = run("git", ["add", "-A"]);
if (result.status !== 0) {
  process.exit(result.status || 1);
}

const staged = capture("git", ["diff", "--cached", "--name-only"]);
if (!staged.stdout.trim()) {
  console.log("没有可提交的内容。");
  process.exit(0);
}

console.log("3/4 提交改动...");
result = run("git", ["commit", "-m", commitMessage()]);
if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log("4/4 推送到 GitHub...");
result = run("git", ["push", "origin", "main"]);
if (result.status !== 0) {
  process.exit(result.status || 1);
}

console.log("");
console.log("发布成功。");
openSite();
