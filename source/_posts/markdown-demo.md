---
title: 'Markdown 排版演示'
date: 2026-04-25 10:00:00
categories:
  - 工程实践
tags:
  - Markdown
  - Hexo
  - 排版
---

这篇文章用来展示博客中各种 Markdown 元素的渲染效果。

## 文本样式

这是**粗体文本**，这是*斜体文本*，这是`行内代码`，这是~~删除线~~。

## 引用

> 设计不是为了让事物看起来更美，而是为了让人们的生活变得更好。
>
> —— 某位伟大的设计师

## 表格

| 技术 | 用途 | 难度 |
| --- | --- | --- |
| Astro | 静态网站 | ⭐⭐ |
| Tailwind CSS | 样式系统 | ⭐⭐ |
| TypeScript | 类型安全 | ⭐⭐⭐ |

## 代码块

### JavaScript

```js
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}
```

### Python

```python
from dataclasses import dataclass

@dataclass
class BlogPost:
    title: str
    date: str
    tags: list[str]

    def summary(self, max_len: int = 80) -> str:
        return self.title[:max_len]
```

### CSS

```css
.card {
  background: var(--color-bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.15s ease;
}

.card:hover {
  transform: translateY(-2px);
}
```

## 链接

访问 [Astro 官方文档](https://docs.astro.build/) 了解更多。

## 有序列表

1. 选择你的技术栈
2. 搭建项目框架
3. 编写内容
4. 部署上线
5. 持续迭代

这篇文章基本涵盖了 Markdown 中常用的元素。如果你的博客也支持这些排版，那么你已经有了一套完整的内容写作工具。
