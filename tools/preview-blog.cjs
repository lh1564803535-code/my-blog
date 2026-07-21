const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

const repoRoot = path.join(__dirname, "..");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const previewUrl = "http://localhost:4000/my-blog/";

function openPreview() {
  spawn("cmd", ["/c", "start", "", previewUrl], {
    cwd: repoRoot,
    detached: true,
    stdio: "ignore",
  }).unref();
}

function checkReady() {
  return new Promise((resolve) => {
    const request = http.get(previewUrl, (response) => {
      response.resume();
      resolve(response.statusCode && response.statusCode < 500);
    });

    request.on("error", () => resolve(false));
    request.setTimeout(2000, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(maxAttempts) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    // Give Hexo time to start before the next probe.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (await checkReady()) {
      return true;
    }
  }
  return false;
}

spawn("powershell", ["-NoExit", "-Command", `Set-Location '${repoRoot.replace(/'/g, "''")}'; & '${npmCommand}' run server`], {
  cwd: repoRoot,
  detached: true,
  stdio: "ignore",
}).unref();

(async () => {
  const isReady = await waitForServer(20);
  openPreview();

  if (!isReady) {
    console.log("预览窗口已经尝试打开。如果页面一开始没出来，等几秒后手动刷新一次就行。");
  }
})();
