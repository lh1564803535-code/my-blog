const { spawnSync, spawn } = require("child_process");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const isWin = process.platform === "win32";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    shell: false,
    ...options,
  });
  if (result.error) {
    console.error(`命令启动失败: ${command} ${args.join(" ")} -> ${result.error.message}`);
  }
  return result;
}

// Windows 下 npm 实际是 npm.cmd，新版 Node（CVE-2024-27980 修复后）禁止 shell:false 直接启动 .cmd，
// 会抛 EINVAL，因此统一改经 cmd /c 调用
function runNpm(args) {
  return isWin ? run("cmd", ["/c", "npm", ...args]) : run("npm", args);
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
let result = runNpm(["run", "build"]);
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
