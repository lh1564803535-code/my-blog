# 博客完整使用手册

## 目录

1. [你的博客地址](#1-你的博客地址)
2. [写一篇新文章（最常用）](#2-写一篇新文章)
3. [编辑已有文章](#3-编辑已有文章)
4. [删除文章](#4-删除文章)
5. [给文章添加图片](#5-给文章添加图片)
6. [修改个人信息](#6-修改个人信息)
7. [修改网站标题和社交链接](#7-修改网站标题和社交链接)
8. [添加新项目到 Projects 页](#8-添加新项目)
9. [修改网站配色](#9-修改网站配色)
10. [本地预览网站](#10-本地预览网站)
11. [推送到 GitHub 上线](#11-推送到-github-上线)
12. [Git 常用命令速查](#12-git-常用命令速查)
13. [项目文件结构说明](#13-项目文件结构说明)
14. [常见问题排查](#14-常见问题排查)
15. [GitHub Token 注意事项](#15-github-token-注意事项)

---

## 1. 你的博客地址

```
https://lh1564803535-code.github.io/my-blog/
```

推送代码后 GitHub Actions 自动部署，等 1-2 分钟即可访问。

---

## 2. 写一篇新文章

**文件位置：** `d:\MyProjects\my-blog\src\content\blog\`

**步骤：**

1. 用 VS Code 打开 `d:\MyProjects\my-blog`
2. 在左侧文件树中找到 `src` → `content` → `blog`
3. 右键 → 新建文件，命名为 `your-post-title.md`（英文小写+短横线）
4. 按以下格式写内容：

```markdown
---
title: "文章标题（中文也行）"
date: 2026-05-10
tags: ["标签1", "标签2"]
description: "一句话概括文章内容，会显示在首页列表"
---

这里是正文，用 Markdown 语法写。

## 二级标题

正文段落。

- 列表项 1
- 列表项 2

> 引用文字

`行内代码`

```代码块
console.log("Hello World");
```
```

5. 保存文件
6. 推送到 GitHub（见第 11 节）

**文件命名规则：**
- 用英文小写字母、数字、短横线
- 不能有空格、中文、特殊符号
- 例如：`my-first-post.md`、`2026-05-what-i-learned.md`

**frontmatter 各字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| title | 是 | 文章标题，显示在页面上 |
| date | 是 | 发布日期，格式 YYYY-MM-DD |
| tags | 否 | 标签数组，如 ["生活", "技术"] |
| description | 否 | 一句话摘要，显示在首页列表 |

---

## 3. 编辑已有文章

**文件位置：** `src/content/blog/` 下的 `.md` 文件

**步骤：**

1. 用 VS Code 打开对应文件
2. 修改标题、日期、标签、正文
3. 保存
4. 推送到 GitHub

**注意事项：**
- 修改 `date` 会影响文章排序（最新日期排最前）
- 修改 `title` 会同步更新页面标题
- 修改文件名会改变文章 URL（比如把 `hello-world.md` 改名，原来的链接就失效了）

---

## 4. 删除文章

**步骤：**

1. 在 VS Code 中找到 `src/content/blog/` 下要删除的 `.md` 文件
2. 右键 → 删除（或按 Delete 键）
3. 确认删除
4. 推送到 GitHub

删除后该文章的 URL 会变成 404，这是正常的。

---

## 5. 给文章添加图片

**步骤：**

1. 把图片文件放到 `public/` 目录下（比如 `public/images/`）
2. 在文章 Markdown 中引用：

```markdown
![图片描述](/images/your-image.png)
```

**示例：**

假设你有一张截图 `screenshot.png`：

1. 把 `screenshot.png` 复制到 `d:\MyProjects\my-blog\public\images\`
2. 在文章中写：

```markdown
这是我的项目截图：

![项目截图](/images/screenshot.png)
```

**注意事项：**
- 图片放在 `public/` 目录下，路径以 `/` 开头
- 图片文件名用英文小写+短横线
- 推荐 PNG 或 JPG 格式，宽度不超过 1200px
- 图片不要太大会影响加载速度

---

## 6. 修改个人信息

**文件位置：** `src/content/about/index.md`

**步骤：**

1. 用 VS Code 打开 `src/content/about/index.md`
2. 修改以下内容：

```markdown
---
name: "dalong"
tagline: "你的副标题"
avatar: "/avatar.svg"
---

## 关于我

这里写你的自我介绍...

## 技能栈

修改你掌握的技能...

## 经历时间线

修改你的工作/教育经历...
```

3. 保存并推送到 GitHub

---

## 7. 修改网站标题和社交链接

**文件位置：** `src/layouts/BaseLayout.astro`

**步骤：**

1. 用 VS Code 打开 `src/layouts/BaseLayout.astro`
2. 搜索并修改以下内容：

**网站标题（侧边栏竖排文字）：**

找到这两行：
```html
<span class="site-title-large">保持思考</span>
<span class="site-title-small">dalong's blog</span>
```

替换成你想要的标题。

**社交链接：**

搜索 `github.com/lh1564803535-code`，替换成你的 GitHub 主页地址。

搜索 `lh1564803535@gmail.com`，替换成你的邮箱。

3. 保存并推送到 GitHub

---

## 8. 添加新项目

**文件位置：** `src/content/projects/`

**步骤：**

1. 在 `src/content/projects/` 目录下新建文件，比如 `new-project.md`
2. 按以下格式写：

```markdown
---
name: "项目名称"
description: "一句话描述这个项目是做什么的"
tags: ["React", "TypeScript"]
github: "https://github.com/lh1564803535-code/project-name"
demo: ""
featured: false
---
```

**字段说明：**

| 字段 | 必填 | 说明 |
|------|------|------|
| name | 是 | 项目名称 |
| description | 否 | 项目描述 |
| tags | 否 | 技术栈标签 |
| github | 否 | GitHub 仓库链接 |
| demo | 否 | 在线演示链接 |
| featured | 否 | 设为 true 会排在最前面 |

3. 保存并推送到 GitHub

---

## 9. 修改网站配色

**文件位置：** `src/styles/global.css`

**当前配色：**

```css
--color-primary: #2e405b;    /* 主色调（深蓝灰） */
--color-bg: #ffffff;         /* 背景色（白色） */
--color-text: #2e405b;       /* 文字颜色 */
```

**修改方法：**

1. 打开 `src/styles/global.css`
2. 搜索 `--color-primary`
3. 修改颜色值（可以用 https://coolors.co 选颜色）
4. 保存并推送到 GitHub

---

## 10. 本地预览网站

**前提条件：** 已安装 Node.js 和 pnpm

**步骤：**

打开终端（PowerShell 或 VS Code 终端），执行：

```bash
cd d:\MyProjects\my-blog
pnpm install
pnpm build
npx serve dist -l 4321
```

看到类似以下输出表示成功：

```
Accepting connections at http://localhost:4321
```

打开浏览器访问 http://localhost:4321

**注意事项：**
- `pnpm install` 只需要第一次或修改 `package.json` 后执行
- `pnpm build` 每次修改代码后都要重新执行
- `npx serve dist` 只是本地预览，不会影响线上

---

## 11. 推送到 GitHub 上线

**每次写完文章或修改代码后，都要执行以下步骤：**

```bash
cd d:\MyProjects\my-blog
git add -A
git commit -m "你的提交信息"
git push
```

**提交信息规范（建议）：**

```
add: 新文章 xxx          ← 新增文章
update: 更新 xxx         ← 更新文章或内容
fix: 修复 xxx            ← 修复问题
delete: 删除 xxx         ← 删除文章
docs: 更新文档           ← 修改说明文档
```

**推送后：**
- GitHub Actions 自动构建部署
- 等 1-2 分钟刷新 https://lh1564803535-code.github.io/my-blog/ 查看效果

---

## 12. Git 常用命令速查

| 操作 | 命令 |
|------|------|
| 查看改了什么文件 | `git status` |
| 查看具体改了哪些内容 | `git diff` |
| 撤销未保存的修改 | `git checkout -- 文件路径` |
| 撤销所有修改 | `git checkout -- .` |
| 查看提交历史 | `git log --oneline` |
| 推送到 GitHub | `git push` |
| 拉取最新代码 | `git pull` |

---

## 13. 项目文件结构说明

```
my-blog/
├── src/
│   ├── content/           ← 内容文件
│   │   ├── blog/          ← 博客文章（.md 文件放这里）
│   │   ├── projects/      ← 项目展示
│   │   └── about/         ← 关于页内容
│   ├── pages/             ← 页面路由（一般不用改）
│   ├── layouts/           ← 布局模板（改标题/链接在这里）
│   └── styles/            ← 全局样式（改配色在这里）
├── public/                ← 静态资源（图片放这里）
├── dist/                  ← 构建产物（自动生成，不用管）
├── .github/workflows/     ← 自动部署配置（不用管）
├── package.json           ← 项目配置（一般不用改）
└── USAGE.md               ← 本文件
```

**你需要动的文件：**

| 文件 | 用途 |
|------|------|
| `src/content/blog/*.md` | 写文章 |
| `src/content/projects/*.md` | 添加项目 |
| `src/content/about/index.md` | 修改个人信息 |
| `src/layouts/BaseLayout.astro` | 改标题、链接 |
| `src/styles/global.css` | 改配色 |
| `public/` | 放图片 |

---

## 14. 常见问题排查

**Q: 推送后网站没有更新？**
A: 等 1-2 分钟。如果还没更新，去 GitHub 仓库页面点 Actions 标签，看部署是否成功。

**Q: 本地预览打不开？**
A: 确保执行了 `pnpm build`，然后 `npx serve dist -l 4321`。

**Q: 文章 URL 有中文/乱码？**
A: 文件名必须用英文小写+短横线，不能用中文。

**Q: 图片显示不出来？**
A: 检查图片是否放在 `public/` 目录下，路径是否以 `/` 开头。

**Q: 推送报错 403？**
A: GitHub Token 权限不足。见第 15 节。

**Q: 想改网站图标（favicon）？**
A: 把新图标放到 `public/favicon.svg`，会自动生效。

---

## 15. GitHub Token 注意事项

**创建 Token 的正确方式：**

1. 打开 https://github.com/settings/tokens/new
2. 选 **Generate new token (Classic)**
3. **不要选 Fine-grained token**（会踩坑）
4. Token name 随便填
5. Expiration 选 90 天
6. **Select scopes 勾选 `repo`**（整行打勾）
7. 点 Generate token
8. 复制 token（只显示一次）

**Fine-grained token 的坑：**
即使勾选了所有 Permissions，还需要在 Repository access 里手动添加目标仓库，否则会返回 403。Classic token 没有这个问题。

**Token 过期后：**
重新创建一个 Classic token，然后执行：

```bash
git config --global credential.helper store
echo "https://用户名:新token@github.com" > ~/.git-credentials
```

---

## 快速参考卡片

**写一篇文章的完整流程：**

```
1. 新建文件 → src/content/blog/xxx.md
2. 写 frontmatter（title, date, tags, description）
3. 写正文
4. 保存
5. 终端执行：
   cd d:\MyProjects\my-blog
   git add -A
   git commit -m "add: 文章标题"
   git push
6. 等 1-2 分钟，访问 https://lh1564803535-code.github.io/my-blog/
```
