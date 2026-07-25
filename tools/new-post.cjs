const readline = require("readline");
const { spawn } = require("child_process");
const posts = require("./lib/posts.cjs");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

function getArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1 || index === process.argv.length - 1) {
    return "";
  }
  return process.argv[index + 1];
}

function openFile(filePath) {
  spawn("powershell", ["-NoProfile", "-Command", `Start-Process -LiteralPath '${filePath.replace(/'/g, "''")}'`], {
    cwd: posts.repoRoot,
    detached: true,
    stdio: "ignore",
  }).unref();
}

async function main() {
  const argTitle = getArg("--title").trim();
  const argCategory = getArg("--category").trim();
  const argTags = getArg("--tags").trim();
  const argSlug = getArg("--slug").trim();

  console.log("");
  console.log("=== 新建博客文章 ===");
  console.log("");

  const title = argTitle || (await ask("文章标题: ")).trim();
  if (!title) {
    console.log("标题不能为空。");
    process.exit(1);
  }

  const categoryMap = {
    "1": "工程实践",
    "2": "技术思考",
    "3": "生活随记",
    "工程实践": "工程实践",
    "技术思考": "技术思考",
    "生活随记": "生活随记",
  };

  let choice = argCategory;
  if (!choice) {
    console.log("");
    console.log("选择分类：");
    console.log("1. 工程实践");
    console.log("2. 技术思考");
    console.log("3. 生活随记");
    choice = (await ask("输入 1 / 2 / 3（默认 1）: ")).trim();
  }
  const category = categoryMap[choice] || "工程实践";

  const tagInput = argTags || (await ask("标签（英文逗号分隔，可留空）: ")).trim();
  const slugInput = argSlug || (await ask("文章网址别名 slug（建议英文，可留空）: ")).trim();

  const result = posts.createPost({ title, category, tags: tagInput, slug: slugInput });
  rl.close();

  console.log("");
  console.log("文章已创建：");
  console.log(result.filePath);
  console.log("配图目录（把图片放进去，正文用 ![](图片名) 引用）：");
  console.log(result.assetDir);
  console.log("");

  openFile(result.filePath);
  console.log("文件已经帮你打开。写完后，双击“发布博客.cmd”即可上线。");
}

main().catch((error) => {
  rl.close();
  console.error(error);
  process.exit(1);
});
