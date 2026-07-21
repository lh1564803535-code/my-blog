const { spawn } = require("child_process");
const path = require("path");

const repoRoot = path.join(__dirname, "..");

spawn("powershell", ["-NoExit", "-Command", `Set-Location '${repoRoot.replace(/'/g, "''")}'; npm run server`], {
  cwd: repoRoot,
  detached: true,
  stdio: "ignore",
}).unref();

setTimeout(() => {
  spawn("cmd", ["/c", "start", "", "http://localhost:4000/my-blog/"], {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore",
  }).unref();
}, 4000);
