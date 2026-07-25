// 纯原生博客搜索：读取 search.json -> 过滤 -> 结果下拉
// 无第三方依赖；配置通过 #blog-search-input 上的 data-* 注入
(function () {
  'use strict';

  var input = document.getElementById('blog-search-input');
  var box = document.getElementById('blog-search-result');
  if (!input || !box) {
    return;
  }

  var DATA_PATH = input.getAttribute('data-search-path') || 'search.json';
  var ROOT = input.getAttribute('data-search-root') || '/';

  var loaded = false;
  var loading = false;
  var entries = [];
  var timer = null;

  function resolveUrl(u) {
    if (!u) return '#';
    if (/^https?:\/\//i.test(u)) return u;
    if (u.charAt(0) === '/') return u;
    return ROOT.replace(/\/?$/, '/') + u.replace(/^\//, '');
  }

  // 兼容裸数组 / {data:[]} / {posts:[]} / {pages:[]} 几种结构
  function normalizeList(json) {
    if (Array.isArray(json)) return json;
    if (json && Array.isArray(json.data)) return json.data;
    if (json && Array.isArray(json.posts)) return json.posts;
    if (json && Array.isArray(json.pages)) return json.pages;
    return [];
  }

  function loadData() {
    if (loaded || loading) return Promise.resolve();
    loading = true;
    return fetch(DATA_PATH, { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        entries = normalizeList(json).map(function (item) {
          return {
            title: (item.title || '').toString(),
            url: item.url || item.path || '',
            content: (item.content || '').toString()
          };
        });
        loaded = true;
      })
      .catch(function () {
        entries = [];
        loaded = false;
      })
      .then(function () {
        loading = false;
      });
  }

  function makeSnippet(content, keyword) {
    var text = content.replace(/\s+/g, ' ').trim();
    if (!text) return '';
    var idx = text.toLowerCase().indexOf(keyword.toLowerCase());
    var start = idx <= 30 ? 0 : idx - 30;
    var snippet = text.substr(start, 120);
    if (start > 0) snippet = '\u2026' + snippet;
    if (start + 120 < text.length) snippet = snippet + '\u2026';
    return snippet;
  }

  function search(keyword) {
    var kw = keyword.trim().toLowerCase();
    if (!kw) return [];
    var terms = kw.split(/\s+/);
    var scored = [];
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      var title = e.title.toLowerCase();
      var hay = title + ' ' + e.content.toLowerCase();
      var ok = true;
      var score = 0;
      for (var t = 0; t < terms.length; t++) {
        if (hay.indexOf(terms[t]) === -1) { ok = false; break; }
        score += title.indexOf(terms[t]) !== -1 ? 3 : 1;
      }
      if (ok) scored.push({ e: e, score: score });
    }
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored.slice(0, 10).map(function (x) { return x.e; });
  }

  function render(results, keyword) {
    if (!keyword) {
      box.innerHTML = '';
      box.hidden = true;
      return;
    }
    box.innerHTML = '';
    if (!results.length) {
      var empty = document.createElement('div');
      empty.className = 'blog-search-empty';
      empty.textContent = '没有找到相关文章';
      box.appendChild(empty);
      box.hidden = false;
      return;
    }
    // 用 DOM API 构建结果：标题/摘要走 textContent，href 走属性赋值，杜绝拼接注入
    results.forEach(function (r) {
      var a = document.createElement('a');
      a.className = 'blog-search-item';
      a.setAttribute('href', resolveUrl(r.url));
      var title = document.createElement('span');
      title.className = 'blog-search-item-title';
      title.textContent = r.title;
      a.appendChild(title);
      var snippet = makeSnippet(r.content, keyword);
      if (snippet) {
        var desc = document.createElement('span');
        desc.className = 'blog-search-item-desc';
        desc.textContent = snippet;
        a.appendChild(desc);
      }
      box.appendChild(a);
    });
    box.hidden = false;
  }

  function onInput() {
    var kw = input.value;
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () {
      if (!kw.trim()) { render([], ''); return; }
      loadData().then(function () { render(search(kw), kw); });
    }, 120);
  }

  input.addEventListener('input', onInput);
  input.addEventListener('focus', function () { loadData(); });
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { box.hidden = true; input.blur(); }
  });
  document.addEventListener('click', function (ev) {
    if (ev.target !== input && !box.contains(ev.target)) {
      box.hidden = true;
    }
  });
})();
