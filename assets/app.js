/* 四书经典阅读 · 公共交互 */
(function () {
  "use strict";
  var body = document.body;

  /* ---------- 原文显示语言 ---------- */
  var langButtons = Array.prototype.slice.call(document.querySelectorAll(".lang-switch button"));
  function setLang(lang) {
    body.setAttribute("data-lang", lang === "all" ? "all" : lang);
    langButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });
  }
  function syncUrl(lang) {
    if (!window.history || !window.history.replaceState) return;
    try {
      var usp = new URLSearchParams(window.location.search);
      if (lang === "all") { usp.delete("lang"); } else { usp.set("lang", lang); }
      var q = usp.toString();
      window.history.replaceState(null, "", q ? "?" + q : window.location.pathname);
    } catch (e) { /* ignore */ }
  }
  langButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var lang = btn.getAttribute("data-lang");
      setLang(lang);
      syncUrl(lang);
    });
  });
  var initial = "all";
  try {
    var q = new URLSearchParams(window.location.search).get("lang");
    if (q === "cn" || q === "tw" || q === "en") initial = q;
  } catch (e) { /* ignore */ }
  setLang(initial);


  /* ---------- 简繁体切换 ---------- */
  var scriptButtons = Array.prototype.slice.call(document.querySelectorAll(".script-switch .script-btn"));
  function setScript(mode) {
    body.setAttribute("data-script", mode === "trad" ? "trad" : "simp");
    scriptButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-script") === mode ? "true" : "false");
    });
    try { localStorage.setItem("sishu-script", mode); } catch (e) {}
  }
  scriptButtons.forEach(function (btn) {
    btn.addEventListener("click", function () { setScript(btn.getAttribute("data-script")); });
  });
  if (scriptButtons.length) {
    var saved = "simp";
    try { saved = localStorage.getItem("sishu-script") || "simp"; } catch (e) {}
    setScript(saved === "trad" ? "trad" : "simp");
  }

  /* ---------- 字号 ---------- */

  var fs = 1;
  function applyFs() { document.documentElement.style.setProperty("--fs", fs.toFixed(2)); }
  var fMinus = document.getElementById("fontMinus");
  var fPlus = document.getElementById("fontPlus");
  if (fMinus) fMinus.addEventListener("click", function () { fs = Math.max(0.88, fs - 0.06); applyFs(); });
  if (fPlus) fPlus.addEventListener("click", function () { fs = Math.min(1.28, fs + 0.06); applyFs(); });

  /* ---------- 打印 ---------- */
  ["printBtn", "printBtn2"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", function () { window.print(); });
  });

  /* ---------- 阅读进度 ---------- */
  var bar = document.getElementById("progressBar");
  function onScroll() {
    if (!bar) return;
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    var p = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max : 0;
    bar.style.width = (Math.min(1, Math.max(0, p)) * 100).toFixed(2) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- 复制原文 ---------- */
  var copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.getAttribute("data-copy") || "";
      function ok() { copyBtn.textContent = "已复制"; setTimeout(function () { copyBtn.textContent = "复制原文"; }, 1600); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); ok(); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(ok, fallback);
      } else { fallback(); }
    });
  }

  /* ---------- 滚动出现 ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".section .wrap > *, .line-card, .book"));
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealEls.forEach(function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 首屏水墨粒子 ---------- */
  var canvas = document.getElementById("inkCanvas");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ctx = canvas.getContext("2d");
    var dots = [];
    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      var r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * DPR));
      canvas.height = Math.max(1, Math.round(r.height * DPR));
      var count = Math.min(46, Math.round(r.width / 22));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          r: (Math.random() * 1.6 + 0.5) * DPR, vy: (Math.random() * 0.25 + 0.06) * DPR,
          vx: (Math.random() - 0.5) * 0.12 * DPR, a: Math.random() * 0.45 + 0.12 });
      }
    }
    function paint() {
      if (!canvas.isConnected) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.y > canvas.height + 8) { d.y = -8; d.x = Math.random() * canvas.width; }
        if (d.x < -8) d.x = canvas.width + 8;
        if (d.x > canvas.width + 8) d.x = -8;
        var g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 5);
        g.addColorStop(0, "rgba(222,193,138," + d.a + ")");
        g.addColorStop(1, "rgba(222,193,138,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * 5, 0, Math.PI * 2);
        ctx.fill();
      }
      window.requestAnimationFrame(paint);
    }
    resize();
    window.addEventListener("resize", resize);
    window.requestAnimationFrame(paint);
  }
})();
