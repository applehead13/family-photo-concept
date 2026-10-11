/* Доработки концепта «семейный фотограф» поверх выгрузки Тильды:
   первый экран и подвал на всё окно, имя, которое уезжает в шапку,
   выравнивание заголовков, звёздочек и вопросов, видоискатель и галереи историй. */
(function () {
  'use strict';

  var HERO = '#rec4193905301', HEADER = '#rec4193905201', MENU = '#rec4193905101';
  var PORTFOLIO = '#rec4193905801', SERVICES = '#rec4193908001', FOOTER = '#rec2340804781';
  var NAME = 'ВЕРА СОКОЛОВА';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(id, r) { return $('.t396__elem[data-elem-id="' + id + '"]', r); }
  function zoomOf(e) { return (e && e.currentCSSZoom) || parseFloat(getComputedStyle(e).zoom) || 1; }
  function visible(e) {
    if (!e) return false;
    var r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(e).display !== 'none' &&
      r.right > 0 && r.left < window.innerWidth;
  }
  function viewportH() { return document.documentElement.clientHeight || window.innerHeight; }
  function textRects(e) {
    var a = e.querySelector('.tn-atom') || e, rg = document.createRange();
    rg.selectNodeContents(a);
    return Array.prototype.filter.call(rg.getClientRects(), function (r) { return r.width > 1; });
  }
  function textBox(e) {
    var rs = textRects(e);
    if (!rs.length) return null;
    var b = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity, last: rs[rs.length - 1], first: rs[0] };
    rs.forEach(function (r) {
      b.left = Math.min(b.left, r.left); b.right = Math.max(b.right, r.right);
      b.top = Math.min(b.top, r.top); b.bottom = Math.max(b.bottom, r.bottom);
    });
    return b;
  }
  // доли высоты строки: где базовая линия и где верх заглавных
  var metricsCache = {};
  function fontMetrics(atom) {
    var cs = getComputedStyle(atom), key = cs.fontWeight + ' 100px ' + cs.fontFamily;
    if (metricsCache[key]) return metricsCache[key];
    var c = document.createElement('canvas').getContext('2d');
    c.font = key;
    var m = c.measureText('ВЕРАСОКЛДН'), asc = m.fontBoundingBoxAscent, desc = m.fontBoundingBoxDescent;
    return (metricsCache[key] = { base: asc / (asc + desc), cap: m.actualBoundingBoxAscent / (asc + desc) });
  }
  function baselineOf(lineRect, atom) { return lineRect.top + lineRect.height * fontMetrics(atom).base; }
  function setTranslate(e, dx, dy) {
    var z = zoomOf(e);
    e.style.translate = (dx / z) + 'px ' + (dy / z) + 'px';
  }

  /* ---------- первый экран на всё окно ---------- */
  // нижняя строка, рукописная подпись и имя прижимаются к низу окна
  var HERO_BOTTOM = ['1765879234070', '1770836201673000001', '1765879234064', '1774443653075000001', '1765960002219000001', '1765965773708000001'];
  function heroFill() {
    var rec = $(HERO); if (!rec) return;
    var art = $('.t396__artboard', rec), parts = [art, $('.t396__carrier', rec), $('.t396__filter', rec)];
    parts.forEach(function (p) { p && p.style.removeProperty('height'); });
    var elems = $$('.t396__elem', rec);
    elems.forEach(function (e) { e.style.translate = ''; if (e._vsBg) { e.style.removeProperty('height'); e._vsBg = false; } });
    var h0 = art.offsetHeight, H = viewportH(), delta = H - h0, artTop = art.getBoundingClientRect().top;
    if (delta < 1) return;
    parts.forEach(function (p) { p && p.style.setProperty('height', H + 'px', 'important'); });
    elems.forEach(function (e) {
      var r = e.getBoundingClientRect(); if (!r.height) return;
      if (r.height >= h0 * 0.8) { e._vsBg = true; e.style.setProperty('height', (H / zoomOf(e)) + 'px', 'important'); return; }
      if (HERO_BOTTOM.indexOf(e.dataset.elemId) >= 0) setTranslate(e, 0, delta);
    });
  }

  /* ---------- имя на первом экране → логотип в шапке ---------- */
  var logo, L = null;
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function logoMeasure() {
    var rec = $(HERO); if (!rec) return;
    if (!logo) {
      logo = document.createElement('div'); logo.id = 'vs-logo'; logo.textContent = NAME;
      logo.setAttribute('aria-hidden', 'true');
      document.body.appendChild(logo);
    }
    var left = el('1765879234070', rec), right = el('1770836201673000001', rec);
    var hdr = el('1770910665784000002', $(HEADER));
    if (!left || !right || !hdr) return;
    var lb = textBox(left), rb = textBox(right), sy = window.scrollY;
    // в мобильной версии подписи могут стоять друг под другом — тогда край по полям артборда
    var art = $('.t396__artboard', rec).getBoundingClientRect();
    var x0 = lb.left, x1 = rb.right;
    if (x1 - x0 < art.width * 0.5) { x0 = Math.min(lb.left, rb.left); x1 = art.right - (x0 - art.left); }
    var rowTop = Math.min(lb.top, rb.top) + sy;

    logo.style.transform = 'none'; logo.style.fontSize = '100px';
    var nb = logo.getBoundingClientRect();
    var size = 100 * (x1 - x0) / nb.width;
    logo.style.fontSize = size + 'px';
    var m = fontMetrics(logo), h = logo.getBoundingClientRect().height, w = logo.getBoundingClientRect().width;
    var gap = Math.max(4, (rowTop - (art.top + sy)) * 0.02);
    var y0 = rowTop - gap - h * m.base;          // базовая линия чуть выше нижней строки
    var hb = textBox(hdr), vw = document.documentElement.clientWidth;
    var hdrStart = $('.t396__artboard', $(HEADER)).getBoundingClientRect();
    var onScreen = hb && hb.left >= 0 && hb.right <= vw;
    // в мобильной шапке своего логотипа нет: ставим имя по центру вместо названия раздела
    document.documentElement.classList.toggle('vs-logo-center', !onScreen);
    var hRect;
    if (onScreen) hRect = { x: hb.left, y: hb.top, w: hb.right - hb.left };
    else {
      var we = Math.min(170, vw * 0.44), he = h * we / w, hh = hdrStart.height || 38;
      hRect = { x: (vw - we) / 2, y: hdrStart.top + (hh - he) / 2 + he * 0.04, w: we };
    }
    var heroH = art.height;
    L = {
      x0: x0, y0: y0, x1: hRect.x, y1: hRect.y - hdrStart.top + 0, k: hRect.w / w,
      end: Math.max(120, heroH - (hdrStart.height || 38) - 40),
      c0: [255, 255, 255, .82], c1: [73, 64, 62, 1]
    };
    logoUpdate();
    logo.classList.add('vs-ready');
  }
  function logoUpdate() {
    if (!L || !logo) return;
    var s = window.scrollY, t = Math.min(1, Math.max(0, s / L.end)), e = ease(t);
    var x = lerp(L.x0, L.x1, e), y = lerp(L.y0 - s, L.y1, e), k = Math.exp(lerp(0, Math.log(L.k), e));
    logo.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + k + ')';
    var c = L.c0.map(function (v, i) { return lerp(v, L.c1[i], e); });
    logo.style.color = 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + c[3].toFixed(3) + ')';
    document.documentElement.classList.toggle('vs-docked', t >= 1);
  }

  /* ---------- меню: без скобок и квадрата «ВС» ---------- */
  function cleanMenus() {
    $$('.t396__elem[data-elem-type="text"]').forEach(function (e) {
      var t = (e.textContent || '').replace(/\s+/g, '');
      if (t === '[' || t === ']') e.classList.add('vs-hide');
      if (t === 'ВС') {
        var id = e.dataset.elemId.slice(0, 13), g = e.closest('.t396__group');
        if (g) g.classList.add('vs-hide');
        $$('.t396__elem', e.closest('.t396__artboard')).forEach(function (s) {
          if (s.dataset.elemId.slice(0, 13) === id) s.classList.add('vs-hide');
        });
      }
    });
    [HERO, HEADER, MENU].forEach(function (sel) {
      var rec = $(sel); if (!rec) return;
      $$('.t396__elem[data-elem-type="text"]', rec).forEach(function (e) {
        var a = e.querySelector('a'), t = (e.textContent || '').trim();
        if (a && t.length > 1 && t.length < 30 && !e.classList.contains('vs-hide')) e.classList.add('vs-nav');
      });
      // подсветки-плашки под пунктами меню, которые раньше раздвигали скобки
      $$('.t396__elem[data-elem-type="shape"]', rec).forEach(function (s) {
        var r = s.getBoundingClientRect();
        if (r.height > 0 && r.height < 20 && r.width > 40 && r.width < 160 && !getComputedStyle(s.querySelector('.tn-atom') || s).backgroundImage.match(/url/)) s.classList.add('vs-hide');
      });
    });
  }

  /* ---------- портфолио: название заходит на рамку фото на 20 px ---------- */
  var CASES = [
    { title: '1788357835493000012', thumb: '1788357868048000015', cover: '1788357835492000003' },
    { title: '1770637180993000009', thumb: '1784906929886000002', cover: '1770637180993000014' },
    { title: '1770637322488000012', thumb: '1784729865767000005', cover: '1770637322487000003' },
    { title: '1770637907083000023', thumb: '1784906568319', cover: '1770637907083000028' },
    { title: '1770629111921000001', thumb: '1784906948506000003', cover: '1770629036350000002' }
  ];
  function alignCaseTitles() {
    var rec = $(PORTFOLIO); if (!rec) return;
    CASES.forEach(function (c) {
      var t = el(c.title, rec), th = el(c.thumb, rec);
      if (!t || !th) return;
      t.style.translate = '';
      if (!visible(t) || !visible(th)) return;
      var b = textBox(t); if (!b) return;
      var atom = t.querySelector('.tn-atom');
      // белая рамка вокруг превью — это группа, в которую оно вложено
      var g = th.closest('.t396__group'), tr = th.getBoundingClientRect();
      var fr = g && g.getBoundingClientRect().width < tr.width * 1.5 ? g.getBoundingClientRect() : tr;
      var base = baselineOf(b.last, atom), frameTop = fr.top;
      var dy = frameTop + 20 * zoomOf(th) - base;
      setTranslate(t, 0, dy);
      var holder = (fr !== tr && g) || th;
      holder.style.zIndex = (parseInt(getComputedStyle(t).zIndex, 10) || 3) + 5;
    });
  }

  /* ---------- услуги: звёздочка вплотную к названию, цены в одну строку ---------- */
  function alignStars() {
    var rec = $(SERVICES); if (!rec) return;
    $$('.t396__elem[data-elem-type="text"]', rec).forEach(function (e) {
      if (/\d\s?\d{3}₽|₽\/час/.test(e.textContent)) e.classList.add('vs-nowrap');
    });
    var titles = $$('.t396__elem[data-elem-type="text"]', rec).filter(function (e) {
      var a = e.querySelector('.tn-atom');
      return a && /Moniqa/.test(getComputedStyle(a).fontFamily) && !/\?/.test(e.textContent) && visible(e);
    });
    var stars = $$('.t396__elem[data-elem-type="shape"]', rec).filter(function (s) {
      var a = s.querySelector('.tn-atom') || s;
      return /6134-6435-4665-a462-623832386266/.test(getComputedStyle(a).backgroundImage);
    });
    stars.forEach(function (s) {
      var g = s.closest('.t396__group') || s;
      g.style.translate = '';
      if (!visible(s)) return;
      var sr = s.getBoundingClientRect(), cy = (sr.top + sr.bottom) / 2, best = null, bd = 1e9;
      titles.forEach(function (t) {
        var r = t.getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - cy);
        if (d < bd && d < r.height * 1.2) { bd = d; best = t; }
      });
      if (!best) return;
      var b = textBox(best), atom = best.querySelector('.tn-atom'), mt = fontMetrics(atom);
      var line = b.first, base = baselineOf(line, atom), capTop = base - line.height * mt.cap;
      var z = zoomOf(s), dx = (b.first === b.last ? b.right : line.right) + 3 * z - sr.left, dy = capTop - 3 * z - sr.top;
      setTranslate(g, dx, dy);
    });
  }

  /* ---------- подвал на всё окно, призыв по ширине карточки ---------- */
  function footerFill() {
    var rec = $(FOOTER); if (!rec) return;
    var art = $('.t396__artboard', rec), card = el('1775147712246', rec);
    var bottoms = ['1775148792218000001', '1775149352210000009', '1788427423756000001'].map(function (id) { return el(id, rec); }).filter(Boolean);
    var cta = el('1775148792218000001', rec);
    if (!card) return;
    [card].concat(bottoms).forEach(function (e) { e.style.translate = ''; });
    card.style.removeProperty('height');
    if (cta) { var ca = cta.querySelector('.tn-atom'); ca.style.removeProperty('font-size'); ca.style.removeProperty('text-align'); cta.style.removeProperty('width'); }
    if (!visible(card)) return;
    var ar = art.getBoundingClientRect(), cr = card.getBoundingClientRect();
    var margin = Math.max(8, cr.left - ar.left), z = zoomOf(card);
    var target = ar.bottom - margin, grow = target - cr.bottom;
    if (grow > 1) {
      card.style.setProperty('height', ((cr.height + grow) / z) + 'px', 'important');
      bottoms.forEach(function (e) { setTranslate(e, 0, grow); });
    }
    if (cta) {
      var atom = cta.querySelector('.tn-atom'), b0 = textBox(cta);
      if (!b0) return;
      var base0 = baselineOf(b0.last, atom);
      var pad = 12 * z, width = (cr.width) - 2 * pad, fs = parseFloat(getComputedStyle(atom).fontSize);
      atom.style.setProperty('font-size', (fs * width / (b0.right - b0.left)) + 'px', 'important');
      atom.style.setProperty('text-align', 'center', 'important');
      cta.style.setProperty('width', (width / zoomOf(cta)) + 'px', 'important');
      var b1 = textBox(cta), base1 = baselineOf(b1.last, atom);
      var dx = (cr.left + pad) - b1.left - (b1.right - b1.left - width) / 2;
      var cur = cta.style.translate.split(' ').map(parseFloat), zc = zoomOf(cta);
      var tx = (cur[0] || 0) * zc + dx, ty = (cur[1] || 0) * zc + (base0 - base1);
      // призыв не должен наезжать на подписи под ним
      var below = bottoms.filter(function (e) { return e !== cta && visible(e); })
        .map(function (e) { var tb = textBox(e); return tb ? tb.top : Infinity; });
      var limit = Math.min.apply(null, below.concat([Infinity])) - 18 * z;
      var over = (base1 + (base0 - base1)) - limit;
      if (over > 0) ty -= over;
      setTranslate(cta, tx, ty);
    }
  }

  /* ---------- курсор-видоискатель ---------- */
  var vf, photos = [], vfOn = false;
  var EXIF = ['f/1.8 · 1/250 · ISO 200', 'f/2.0 · 1/320 · ISO 100', 'f/2.8 · 1/200 · ISO 400', 'f/1.4 · 1/500 · ISO 100', 'f/2.2 · 1/160 · ISO 800'];
  function collectPhotos() {
    photos = $$('.t396__elem').filter(function (e) {
      var a = e.querySelector('.tn-atom') || e, bg = getComputedStyle(a).backgroundImage;
      return /photo-(case|hero|me|workplace|moment)/.test(bg) || e.querySelector('img[src*="photo-"], video, .mini-scroll-frame');
    });
    photos.forEach(function (e, i) {
      e.classList.add('vs-photo');
      e._vsLabel = galleryOf(e) ? 'смотреть историю →' : EXIF[i % EXIF.length];
    });
  }
  function initViewfinder() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    vf = document.createElement('div'); vf.id = 'vs-vf'; document.body.appendChild(vf);
    var cur = null;
    document.addEventListener('mousemove', function (ev) {
      vf.style.transform = 'translate(' + ev.clientX + 'px,' + ev.clientY + 'px)';
      var hit = null, top = document.elementFromPoint(ev.clientX, ev.clientY);
      if (top && !top.closest('a, button, #vs-lb')) {
        for (var i = 0; i < photos.length; i++) {
          var r = photos[i].getBoundingClientRect();
          if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom && visible(photos[i])) { hit = photos[i]; break; }
        }
      }
      if (hit !== cur) {
        cur = hit;
        vf.classList.remove('vs-on'); void vf.offsetWidth;
        if (hit) { vf.dataset.label = hit._vsLabel; vf.classList.add('vs-on'); }
        document.documentElement.classList.toggle('vs-vf-active', !!hit);
      }
    }, { passive: true });
    document.addEventListener('mousedown', function () { if (cur) vf.classList.add('vs-press'); });
    document.addEventListener('mouseup', function () { vf.classList.remove('vs-press'); });
  }

  /* ---------- галереи историй ---------- */
  var G = window.VS_GALLERIES || [];
  function galleryOf(e) {
    var id = e.dataset && e.dataset.elemId;
    for (var i = 0; i < CASES.length; i++) if (CASES[i].thumb === id || CASES[i].cover === id) return G[i] ? i : null;
    return null;
  }
  var lb, lbIdx = 0, lbCase = 0;
  function lbRender() {
    var g = G[lbCase], p = g.photos;
    lb.querySelector('.vs-lb-title').textContent = g.title;
    lb.querySelector('.vs-lb-meta').textContent = g.meta + ' · ' + String(lbIdx + 1).padStart(2, '0') + '/' + String(p.length).padStart(2, '0');
    var img = lb.querySelector('.vs-lb-stage img');
    img.style.opacity = 0;
    img.onload = function () { img.style.opacity = 1; };
    img.src = p[lbIdx]; img.alt = g.title + ', кадр ' + (lbIdx + 1);
    $$('.vs-lb-strip button', lb).forEach(function (b, i) { b.classList.toggle('vs-cur', i === lbIdx); });
  }
  function lbOpen(ci) {
    lbCase = ci; lbIdx = 0;
    var strip = lb.querySelector('.vs-lb-strip'); strip.innerHTML = '';
    G[ci].photos.forEach(function (src, i) {
      var b = document.createElement('button'); b.type = 'button';
      b.style.backgroundImage = 'url("' + (G[ci].thumbs ? G[ci].thumbs[i] : src) + '")';
      b.setAttribute('aria-label', 'Кадр ' + (i + 1));
      b.addEventListener('click', function () { lbIdx = i; lbRender(); });
      strip.appendChild(b);
    });
    lbRender();
    lb.classList.add('vs-open'); document.documentElement.classList.add('vs-lb-lock');
    lb.focus();
  }
  function lbClose() { lb.classList.remove('vs-open'); document.documentElement.classList.remove('vs-lb-lock'); }
  function lbStep(d) { var n = G[lbCase].photos.length; lbIdx = (lbIdx + d + n) % n; lbRender(); }
  function initGallery() {
    if (!G.length) return;
    lb = document.createElement('div'); lb.id = 'vs-lb';
    lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.tabIndex = -1;
    lb.innerHTML = '<div class="vs-lb-top"><div><div class="vs-lb-title"></div><div class="vs-lb-meta"></div></div>' +
      '<button type="button" class="vs-lb-close">закрыть ✕</button></div>' +
      '<button type="button" class="vs-lb-nav vs-lb-prev" aria-label="Предыдущий кадр">←</button>' +
      '<div class="vs-lb-stage"><img alt=""></div>' +
      '<button type="button" class="vs-lb-nav vs-lb-next" aria-label="Следующий кадр">→</button>' +
      '<div class="vs-lb-hint">← → листать · esc закрыть</div><div class="vs-lb-strip"></div>';
    document.body.appendChild(lb);
    lb.querySelector('.vs-lb-close').addEventListener('click', lbClose);
    lb.querySelector('.vs-lb-prev').addEventListener('click', function () { lbStep(-1); });
    lb.querySelector('.vs-lb-next').addEventListener('click', function () { lbStep(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('vs-lb-stage')) lbClose(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('vs-open')) return;
      if (e.key === 'Escape') lbClose();
      if (e.key === 'ArrowLeft') lbStep(-1);
      if (e.key === 'ArrowRight') lbStep(1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) lbStep(dx < 0 ? 1 : -1);
    });
    CASES.forEach(function (c, i) {
      if (!G[i]) return;
      [c.cover, c.thumb].forEach(function (id) {
        $$('.t396__elem[data-elem-id="' + id + '"]').forEach(function (e) {
          e.style.cursor = 'pointer';
          e.addEventListener('click', function (ev) { ev.preventDefault(); ev.stopPropagation(); lbOpen(i); }, true);
        });
      });
    });
  }

  /* ---------- запуск ---------- */
  function layout() {
    try { heroFill(); } catch (e) { console.warn(e); }
    try { footerFill(); } catch (e) { console.warn(e); }
    try { alignCaseTitles(); } catch (e) { console.warn(e); }
    try { alignStars(); } catch (e) { console.warn(e); }
    try { logoMeasure(); } catch (e) { console.warn(e); }
  }
  var timer;
  function relayout() { clearTimeout(timer); timer = setTimeout(layout, 180); }
  function start() {
    cleanMenus();
    layout();
    collectPhotos();
    initViewfinder();
    initGallery();
    window.addEventListener('scroll', logoUpdate, { passive: true });
    window.addEventListener('resize', relayout);
    setTimeout(layout, 700);
    setTimeout(layout, 2000);
  }
  function ready() {
    var go = function () { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start); };
    if (document.readyState === 'complete') setTimeout(go, 300); else window.addEventListener('load', function () { setTimeout(go, 300); });
  }
  ready();
})();
