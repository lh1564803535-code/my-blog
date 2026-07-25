const readline = require("readline");
const path = require("path");
const posts = require("./lib/posts.cjs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("");
  console.log("=== 删除博客文章 ===");
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

  const answer = (await ask("输入要删除的编号（回车取消）: ")).trim();
  if (!answer) {
    console.log("已取消。");
    rl.close();
    return;
  }

  const index = Number(answer) - 1;
  if (!Number.isInteger(index) || index < 0 || index >= list.length) {
    console.log("编号无效。");
    rl.close();
    return;
  }

  const target = list[index];
  console.log("");
  console.log("将删除：");
  console.log("  文章文件: " + path.join(posts.postsDir, target.name));
  console.log("（若存在同名配图目录也会一并删除）");
  console.log("");

  const confirm = (await ask('确认删除请输入 "yes"（其它任意键取消）: ')).trim().toLowerCase();
  rl.close();

  if (confirm !== "yes") {
    console.log("已取消，没有删除任何文件。");
    return;
  }

  const res = posts.deletePost(target.name);
  console.log("");
  console.log("已删除" + (res.removedAsset ? "（含配图目录）" : "") + "。若要同步线上，双击“发布博客.cmd”。");
}

main().catch((error) => {
  rl.close();
  console.error(error);
  process.exit(1);
});
