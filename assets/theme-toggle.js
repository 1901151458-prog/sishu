/* 四书经典 · 深色 / 纸色背景切换 */
(function () {
  var KEY = 'dsh-theme';
  var OLD = 'sishu-theme';
  var html = document.documentElement;
  var saved = 'dark';
  try { saved = localStorage.getItem(KEY) || localStorage.getItem(OLD) || 'dark'; } catch (e) {}
  if (saved !== 'light' && saved !== 'dark') saved = 'dark';
  html.setAttribute('data-theme', saved);
  html.style.colorScheme = saved === 'dark' ? 'dark' : 'light';

  function update(btn) {
    if (!btn) return;
    var dark = html.getAttribute('data-theme') === 'dark';
    btn.textContent = dark ? '☀ 纸色' : '☾ 拓印';
    btn.setAttribute('aria-label', dark ? '切换到纸色浅色模式' : '切换到深色拓印模式');
    btn.setAttribute('title', dark ? '切换到纸色浅色模式' : '切换到深色拓印模式');
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
  }

  function set(theme) {
    html.setAttribute('data-theme', theme);
    html.style.colorScheme = theme === 'dark' ? 'dark' : 'light';
    try { localStorage.setItem(KEY, theme); try { localStorage.setItem(OLD, theme); } catch (e) {} } catch (e) {}
    document.querySelectorAll('.theme-toggle').forEach(update);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#12100d' : '#141210');
  }

  function inject() {
    var actions = document.querySelector('.topbar-actions');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.addEventListener('click', function () {
      set(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
    if (actions) actions.appendChild(btn);
    else document.body.appendChild(btn);
    update(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
