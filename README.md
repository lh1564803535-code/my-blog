# dalong's blog - Hexo 源项目

这是博客 [dalong's blog](https://lh1564803535-code.github.io/my-blog/) 的源码仓库。

这个版本已经把博客整理成 3 个长期板块：

- 工程实践
- 技术思考
- 生活随记

## 可视化后台（推荐，像公众号后台一样）

双击根目录的 `博客后台.cmd`（或运行 `npm run admin`）会启动一个**只在本机可访问**的网页后台，浏览器会自动打开 `http://127.0.0.1:4777/`：

- 左侧是文章列表，点击任意一篇即可进入编辑；右侧是所见即所得编辑器（Markdown 即时渲染）
- 顶部/工具栏按钮：`＋ 新建文章`、`保存`、`插入图片`、`删除`、`本地预览`、`一键发布`
- `一键发布` 会自动构建 + `git` 提交推送，触发 GitHub Actions 部署，全程无需命令行
- 关闭那个黑色命令行小窗口即停止后台

## 最简单的使用方式

如果你不想碰命令行，直接双击根目录里的这 3 个文件：

- [写新文章.cmd](C:/Users/lhhaoshuai/Documents/blog/写新文章.cmd)
- [本地预览.cmd](C:/Users/lhhaoshuai/Documents/blog/本地预览.cmd)
- [发布博客.cmd](C:/Users/lhhaoshuai/Documents/blog/发布博客.cmd)

### 写文章

双击 `写新文章.cmd`：

1. 输入标题
2. 选分类
3. 写几个标签
4. 自动创建文章并打开文件

### 预览

双击 `本地预览.cmd`：

- 会自动启动本地服务器
- 会自动打开 [http://localhost:4000/my-blog/](http://localhost:4000/my-blog/)

### 发布

双击 `发布博客.cmd`：

- 自动构建
- 自动 `git add`
- 自动 `git commit`
- 自动 `git push`

你基本不需要手动写 Git 命令了。

### 修改 / 删除文章

- 双击 `修改文章.cmd`：列出所有文章 → 输入编号 → 自动打开对应文件编辑。
- 双击 `删除文章.cmd`：列出所有文章 → 输入编号 → 输入 `yes` 二次确认 → 删除文章（含同名配图目录）。

### 给文章配图

每篇新文章会自动生成一个「同名配图目录」。把图片放进去，正文里用相对写法引用即可：

```markdown
![示意图](图片文件名.png)
```

### 站内搜索

页面侧栏有一个搜索框，输入关键词即可在标题与正文中即时检索。数据来自构建时生成的 `search.json`，纯前端实现，无需服务器。

## 目录结构

```text
blog/
|- docs/CONTENT_STRATEGY.md
|- tools/
|- source/_posts/
|- source/practice/
|- source/thinking/
|- source/life/
`- themes/typography/
```

## 内容分类规则

详细说明见 [docs/CONTENT_STRATEGY.md](C:/Users/lhhaoshuai/Documents/blog/docs/CONTENT_STRATEGY.md)。

一句话版：

- 教人做事的，放 `工程实践`
- 表达判断的，放 `技术思考`
- 记录日常的，放 `生活随记`

具体技术关键词，比如 `Kubernetes`、`Linux`、`Prometheus`、`Career`，都放在 tags 里。

## 命令行方式

如果你偶尔还是想用命令行：

```powershell
npm install
npm run write
npm run preview:open
npm run publish:easy
```

## 常改位置

- 站点配置：[ _config.yml ](C:/Users/lhhaoshuai/Documents/blog/_config.yml)
- 内容策略：[ docs/CONTENT_STRATEGY.md ](C:/Users/lhhaoshuai/Documents/blog/docs/CONTENT_STRATEGY.md)
- 文章目录：[ source/_posts ](C:/Users/lhhaoshuai/Documents/blog/source/_posts)
- 三个栏目页：
  [工程实践](C:/Users/lhhaoshuai/Documents/blog/source/practice/index.md)
  [技术思考](C:/Users/lhhaoshuai/Documents/blog/source/thinking/index.md)
  [生活随记](C:/Users/lhhaoshuai/Documents/blog/source/life/index.md)
