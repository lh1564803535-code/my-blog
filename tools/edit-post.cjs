const readline = require("readline");
const path = require("path");
const { spawn } = require("child_process");
const posts = require("./lib/posts.cjs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function openFile(filePath) {
  spawn("powershell", ["-NoProfile", "-Command", `Start-Process -LiteralPath '${filePath.replace(/'/g, "''")}'`], {
    cwd: posts.repoRoot,
    detached: true,
    stdio: "ignore",
  }).unref();
}

async function main() {
  console.log("");
  console.log("=== 修改博客文章 ===");
  console.log("");

  const list = posts.listPosts();
  if (!list.length) {
    console.log("source/_posts 里还没有文章。");
    rl.close();
    return;
  }

  list.forEach((post, index) => {
    console.log(`${String(index + 1).padStart(2, " ")}. ${post.name}  ——  ${post.title}`);
  });
  console.log("");

  const answer = (await ask("输入要修改的编号（回车取消）: ")).trim();
  rl.close();

  if (!answer) {
    console.log("已取消。");
    return;
  }

  const index = Number(answer) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= list.length) {
    console.log("编号无效。");
    return;
  }

  const target = list[index];
  const full = path.join(posts.postsDir, target.name);
  console.log("");
  console.log("正在打开：");
  console.log(full);
  openFile(full);
  console.log("改完保存后，双击“发布博客.cmd”即可上线。");
}

main().catch((error) => {
  rl.close();
  console.error(error);
  process.exit(1);
});
