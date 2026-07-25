(function () {
  'use strict';

  var state = {
    posts: [], categories: [], current: null, meta: null,
    useVditor: false, vd: null, vdReady: false, pending: null
  };

  function $(id) { return document.getElementById(id); }

  var TOKEN = (document.getElementById('admin-token') || {}).content || '';

  function api(path, opts) {
    opts = opts || {};
    var headers = { 'X-Admin-Token': TOKEN };
    if (opts.headers) { for (var k in opts.headers) headers[k] = opts.headers[k]; }
    opts.headers = headers;
    return fetch(path, opts).then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok || j.ok === false) throw new Error(j.error || ('HTTP ' + r.status));
        return j;
      });
    });
  }

  function toast(msg, isErr) {
    var t = $('toast');
    t.textContent = msg;
    t.className = 'toast' + (isErr ? ' toast-err' : '');
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function editorGetValue() {
    return state.useVditor && state.vd ? state.vd.getValue() : $('fallback').value;
  }
  function editorSetValue(v) {
    if (state.useVditor) {
      if (state.vd && state.vdReady) { state.vd.setValue(v || ''); }
      else { state.pending = v || ''; }
    } else {
      $('fallback').value = v || '';
    }
  }

  function renderCategories() {
    var sel = $('meta-category');
    sel.innerHTML = '';
    state.categories.forEach(function (c) {
      var o = document.createElement('option');
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
  }

  function renderList(filter) {
    var ul = $('post-list');
    ul.innerHTML = '';
    var kw = (filter || '').trim().toLowerCase();
    state.posts.filter(function (p) {
      return !kw || (p.title + ' ' + p.name).toLowerCase().indexOf(kw) !== -1;
    }).forEach(function (p) {
      var li = document.createElement('li');
      li.className = 'post-item' + (state.current === p.name ? ' active' : '');
      li.innerHTML = '<span class="pi-title"></span><span class="pi-meta"></span>';
      li.querySelector('.pi-title').textContent = p.title;
      li.querySelector('.pi-meta').textContent = ((p.categories && p.categories[0]) || '') + ' · ' + (p.date || '').slice(0, 10);
      li.addEventListener('click', function () { openPost(p.name); });
      ul.appendChild(li);
    });
  }

  function refreshGit(g) {
    if (!g) return;
    var el = $('git-status');
    el.textContent = g.dirty ? ('待发布改动：' + g.changes) : '无待发布改动';
    el.className = 'git-status' + (g.dirty ? ' dirty' : '');
  }

  function loadPosts() {
    return api('/api/posts').then(function (j) {
      state.posts = j.posts || [];
      state.categories = j.categories || [];
      renderCategories();
      renderList($('search').value);
      refreshGit(j.git);
    });
  }

  function openPost(name) {
    return api('/api/post?name=' + encodeURIComponent(name)).then(function (j) {
      state.current = name;
      state.meta = j.meta || { title: '', date: '', categories: [], tags: [], extra: [] };
      $('empty-hint').hidden = true;
      $('editor-wrap').hidden = false;
      $('meta-title').value = state.meta.title || '';
      $('meta-category').value = (state.meta.categories && state.meta.categories[0]) || state.categories[0];
      $('meta-tags').value = (state.meta.tags || []).join(', ');
      editorSetValue(j.body || '');
      renderList($('search').value);
      $('save-hint').textContent = '';
    }).catch(function (e) { toast(e.message, true); });
  }

  function save() {
    if (!state.current) return;
    var title = $('meta-title').value.trim();
    if (!title) { toast('标题不能为空', true); $('meta-title').focus(); return; }
    var meta = {
      title: title,
      date: (state.meta && state.meta.date) || '',
      categories: [$('meta-category').value],
      tags: $('meta-tags').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
      extra: (state.meta && state.meta.extra) || []
    };
    return api('/api/post', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: state.current, meta: meta, body: editorGetValue() })
    }).then(function () {
      state.meta = meta;
      $('save-hint').textContent = '已保存 ' + new Date().toLocaleTimeString();
      toast('已保存');
      return loadPosts();
    }).catch(function (e) { toast(e.message, true); });
  }

  function createNew() {
    var title = prompt('新文章标题：');
    if (!title || !title.trim()) return;
    api('/api/post', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), category: state.categories[0], tags: '' })
    }).then(function (j) {
      toast('已创建');
      return loadPosts().then(function () { return openPost(j.name); });
    }).catch(function (e) { toast(e.message, true); });
  }

  function del() {
    if (!state.current) return;
    if (!confirm('确定删除《' + ($('meta-title').value || state.current) + '》？\n将同时删除同名配图目录，且不可撤销。')) return;
    api('/api/post?name=' + encodeURIComponent(state.current), { method: 'DELETE' })
      .then(function () {
        toast('已删除');
        state.current = null;
        $('editor-wrap').hidden = true;
        $('empty-hint').hidden = false;
        return loadPosts();
      }).catch(function (e) { toast(e.message, true); });
  }

  function publish() {
    if (!confirm('一键发布：将构建并 git 提交推送到 GitHub（触发自动部署）。继续？')) return;
    var btn = $('btn-publish');
    btn.disabled = true; btn.textContent = '发布中…';
    api('/api/publish', { method: 'POST' })
      .then(function (j) {
        toast(j.ok ? '发布成功，GitHub Actions 正在部署' : '发布失败，请看控制台窗口', !j.ok);
        if (j.output) console.log(j.output);
        return loadPosts();
      })
      .catch(function (e) { toast(e.message, true); })
      .then(function () { btn.disabled = false; btn.textContent = '一键发布'; });
  }

  function preview() {
    api('/api/preview', { method: 'POST' }).then(function () {
      toast('本地预览启动中，预览脚本会自动打开浏览器…');
    }).catch(function (e) { toast(e.message, true); });
  }

  function insertImage() {
    if (!state.current) { toast('请先选择或新建文章', true); return; }
    $('file-input').click();
  }
  function onFile(ev) {
    var f = ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      api('/api/upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: state.current, filename: f.name, dataBase64: reader.result })
      }).then(function (j) {
        var md = '![](' + j.filename + ')';
        if (state.useVditor && state.vd) { state.vd.insertValue(md); }
        else { $('fallback').value += '\n' + md + '\n'; }
        toast('图片已插入');
      }).catch(function (e) { toast(e.message, true); });
    };
    reader.readAsDataURL(f);
  }

  function initEditor() {
    if (typeof Vditor !== 'undefined') {
      state.useVditor = true;
      state.vd = new Vditor('vditor', {
        mode: 'ir',
        height: '100%',
        cache: { enable: false },
        placeholder: '在此撰写正文…',
        toolbar: ['headings', 'bold', 'italic', 'strike', 'link', '|', 'list', 'ordered-list', 'check', 'quote', 'line', 'code', 'inline-code', '|', 'table', 'undo', 'redo', '|', 'preview', 'fullscreen'],
        after: function () {
          state.vdReady = true;
          if (state.pending != null) { state.vd.setValue(state.pending); state.pending = null; }
        }
      });
    } else {
      state.useVditor = false;
      $('vditor').hidden = true;
      $('fallback').hidden = false;
    }
  }

  function bind() {
    $('search').addEventListener('input', function () { renderList(this.value); });
    $('btn-new').addEventListener('click', createNew);
    $('btn-save').addEventListener('click', save);
    $('btn-delete').addEventListener('click', del);
    $('btn-publish').addEventListener('click', publish);
    $('btn-preview').addEventListener('click', preview);
    $('btn-image').addEventListener('click', insertImage);
    $('file-input').addEventListener('change', onFile);
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); save(); }
    });
  }

  window.addEventListener('DOMContentLoaded', function () {
    bind();
    initEditor();
    loadPosts().catch(function (e) { toast(e.message, true); });
  });
})();
