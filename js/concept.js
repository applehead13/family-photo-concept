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
      c0: window.VS_LOGO_FROM || [255, 255, 255, .82], c1: [73, 64, 62, 1]
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
  // цены — шрифтом названий, крупнее, на одной базовой линии с названием услуги
  function alignPrices() {
    var rec = $(SERVICES); if (!rec) return;
    var titles = $$('.t396__elem[data-elem-type="text"]', rec).filter(function (e) {
      var a = e.querySelector('.tn-atom');
      return a && !e.classList.contains('vs-price') && /Moniqa/.test(getComputedStyle(a).fontFamily) && !/\?/.test(e.textContent) && visible(e) && !e.closest('[data-animate-sbs-event="hover"]');
    });
    var priced = [];
    $$('.t396__elem[data-elem-type="text"]', rec).forEach(function (e) {
      if (!/\d\s?\d{3}₽/.test(e.textContent) || e.closest('[data-animate-sbs-event="hover"]')) return;
      e.classList.add('vs-price');
      e.style.translate = '';
      if (!visible(e)) return;
      var er = e.getBoundingClientRect(), cy = (er.top + er.bottom) / 2, best = null, bd = 1e9;
      titles.forEach(function (t) {
        var r = t.getBoundingClientRect(), d = Math.abs((r.top + r.bottom) / 2 - cy);
        if (d < bd && d < 60 * zoomOf(t)) { bd = d; best = t; }
      });
      if (!best) return;
      var ta = best.querySelector('.tn-atom'), atom = e.querySelector('.tn-atom');
      atom.style.setProperty('font-size', Math.round(parseFloat(getComputedStyle(ta).fontSize) * 0.62) + 'px', 'important');
      atom.style.setProperty('color', getComputedStyle(ta).color, 'important');
      // справа в строке — квадратик-отметка: цена не должна на него наезжать
      var room = 1e9;
      $$('.t396__elem[data-elem-type="shape"]', rec).forEach(function (sh) {
        var r = sh.getBoundingClientRect();
        if (r.width > 0 && r.width < 20 * zoomOf(sh) && r.left > er.left && Math.abs((r.top + r.bottom) / 2 - cy) < 40 * zoomOf(sh)) room = Math.min(room, r.left - 12 * zoomOf(sh) - er.left);
      });
      priced.push({ e: e, best: best, ta: ta, atom: atom, room: room });
    });
    // один размер на все цены: самый крупный, при котором каждая помещается
    var k = 1;
    priced.forEach(function (p) { var b = textBox(p.e); if (b && p.room < 1e9) k = Math.min(k, p.room / (b.right - b.left)); });
    priced.forEach(function (p) {
      if (k < 1) p.atom.style.setProperty('font-size', (parseFloat(getComputedStyle(p.ta).fontSize) * 0.62 * k).toFixed(2) + 'px', 'important');
      var tb = textBox(p.best), pb = textBox(p.e);
      if (!tb || !pb) return;
      setTranslate(p.e, 0, baselineOf(tb.first, p.ta) - baselineOf(pb.first, p.atom));
    });
  }
  function alignStars() {
    var rec = $(SERVICES); if (!rec) return;
    $$('.t396__elem[data-elem-type="text"]', rec).forEach(function (e) {
      if (/\d\s?\d{3}₽|₽\/час/.test(e.textContent)) e.classList.add('vs-nowrap');
    });
    var titles = $$('.t396__elem[data-elem-type="text"]', rec).filter(function (e) {
      var a = e.querySelector('.tn-atom');
      return a && !e.classList.contains('vs-price') && /Moniqa/.test(getComputedStyle(a).fontFamily) && !/\?/.test(e.textContent) && visible(e);
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


  /* ---------- этапы работы: пункты сразу под заголовком, отступ везде одинаковый ---------- */
  var STAGES = '#rec4193906401';
  function alignStages() {
    var rec = $(STAGES); if (!rec) return;
    var texts = $$('.t396__elem[data-elem-type="text"]', rec);
    texts.forEach(function (e) { e.style.translate = ''; });
    texts.forEach(function (h) {
      var a = h.querySelector('.tn-atom');
      if (!a || !/Moniqa/.test(getComputedStyle(a).fontFamily) || !visible(h)) return;
      var hb = textBox(h); if (!hb) return;
      if (hb.bottom - hb.top > 200) return;            // большой заголовок блока
      var list = null, best = 1e9;
      texts.forEach(function (t) {
        if (t === h || !t.querySelector('.vs-li, .vs-b') || !visible(t)) return;
        var tb = textBox(t); if (!tb) return;
        var dy = tb.top - hb.bottom, dx = Math.abs(tb.left - hb.left);
        if (dy > -5 && dx < 40 && dy < best) { best = dy; list = t; }
      });
      if (!list) return;
      var gap = 10 * zoomOf(h), lb = textBox(list);
      setTranslate(list, 0, hb.bottom + gap - lb.top);
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
    vf = document.createElement('div'); vf.id = 'vs-vf'; vf.appendChild(document.createElement('i'));
    document.body.appendChild(vf);
    var flash = document.createElement('div'); flash.id = 'vs-flash'; document.body.appendChild(flash);
    document.documentElement.classList.add('vs-vf-active');
    var cur = null, link = false;
    document.addEventListener('mousemove', function (ev) {
      vf.style.transform = 'translate(' + ev.clientX + 'px,' + ev.clientY + 'px)';
      vf.classList.add('vs-ready');
      var hit = null, top = document.elementFromPoint(ev.clientX, ev.clientY);
      var isLink = !!(top && top.closest('a, button, [role=button], .vs-nav, .tn-elem[data-elem-type="button"], .t396__elem a'));
      if (top && !isLink && !top.closest('#vs-lb')) {
        // только фото, которое сверху под курсором (или его рамка/подпись в той же группе)
        var g = top.closest('.t396__group');
        for (var j = 0; j < photos.length && !hit; j++) {
          var ph = photos[j];
          if ((ph === top || ph.contains(top) || (top.closest('.t396__elem') && top.contains(ph)) || (g && g.contains(ph))) && visible(ph)) {
            var r = ph.getBoundingClientRect();
            if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) hit = ph;
          }
        }
      }
      if (isLink !== link) { link = isLink; vf.classList.toggle('vs-link', link); }
      if (hit !== cur) {
        cur = hit;
        vf.classList.remove('vs-on'); void vf.offsetWidth;
        if (hit) { vf.dataset.label = hit._vsLabel; vf.classList.add('vs-on'); }
      }
    }, { passive: true });
    document.addEventListener('mouseleave', function () { vf.classList.remove('vs-ready'); });
    document.addEventListener('mousedown', function () { vf.classList.add('vs-press'); });
    document.addEventListener('mouseup', function () {
      vf.classList.remove('vs-press');
      // щелчок затвора: вспышка в рамке, над фото — ещё и лёгкая вспышка на весь экран
      vf.classList.remove('vs-shot'); void vf.offsetWidth; vf.classList.add('vs-shot');
      if (cur) { flash.classList.remove('vs-go'); void flash.offsetWidth; flash.classList.add('vs-go'); }
    });
  }

  /* ---------- услуги: описание открывается по наведению на всю строку, звёздочки — с запасом ---------- */
  function initServiceHover() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var R = $('#rec4193908001'); if (!R) return;
    var zones = [];   // { trg: [elements with Tilda listeners], area: function -> rect, on: bool }
    var byTrg = {};
    $$('[data-animate-sbs-event="hover"]', R).forEach(function (t) {
      (t.dataset.animateSbsTrgels || '').split(',').forEach(function (id) {
        if (id) (byTrg[id] = byTrg[id] || []).push(t);
      });
    });
    function nodes(id) { return $$('[data-elem-id="' + id + '"], [data-group-id="' + id + '"]', R); }
    function rectOf(e) { return e.getBoundingClientRect(); }
    Object.keys(byTrg).forEach(function (id) {
      var trg = nodes(id).filter(function (n) { return n.getBoundingClientRect().width > 0; });
      if (!trg.length) return;
      var isStar = trg.some(function (n) { return n.querySelector('[data-original*="6134-6435-4665-a462-623832386266"], [style*="6134-6435-4665-a462-623832386266"]'); });
      var targets = byTrg[id];
      var area;
      if (isStar) {
        area = function () { var r = rectOf(trg[0]), p = 9; return { l: r.left - p, r: r.right + p, t: r.top - p, b: r.bottom + p }; };
      } else {
        // строка услуги: самая широкая видимая полоса из анимируемых элементов этой строки
        area = function () {
          var best = null;
          targets.forEach(function (t) { var r = rectOf(t); if (r.left >= 0 && r.width > 0 && (!best || r.width > best.width)) best = r; });
          var tr = rectOf(trg[0]);
          if (!best) best = tr;
          return { l: best.left, r: best.right, t: Math.min(best.top, tr.top), b: Math.max(best.bottom, tr.bottom) };
        };
      }
      // настоящие mouseenter/leave на триггере больше не управляют анимацией — ими управляет зона
      trg.forEach(function (n) {
        ['mouseenter', 'mouseleave'].forEach(function (type) {
          n.addEventListener(type, function (ev) { if (ev.isTrusted) ev.stopImmediatePropagation(); }, true);
        });
      });
      zones.push({ trg: trg, area: area, star: isStar, on: false });
    });
    function fire(z, type) { z.trg.forEach(function (n) { n.dispatchEvent(new MouseEvent(type, { bubbles: false })); }); }
    var raf = 0, mx = -1, my = -1;
    function check() {
      raf = 0;
      var starOn = false;
      zones.forEach(function (z) {
        if (!z.star) return;
        var a = z.area(), inside = mx >= a.l && mx <= a.r && my >= a.t && my <= a.b;
        z.want = inside; if (inside) starOn = true;
      });
      zones.forEach(function (z) {
        if (z.star) return;
        var a = z.area();
        z.want = !starOn && mx >= a.l && mx <= a.r && my >= a.t && my <= a.b;
      });
      zones.forEach(function (z) { if (z.want !== z.on) { z.on = z.want; fire(z, z.on ? 'mouseenter' : 'mouseleave'); } });
    }
    function queue(ev) { if (ev) { mx = ev.clientX; my = ev.clientY; } if (!raf) raf = requestAnimationFrame(check); }
    document.addEventListener('mousemove', queue, { passive: true });
    window.addEventListener('scroll', function () { queue(); }, { passive: true });
    document.addEventListener('mouseleave', function () { mx = my = -1; queue(); });
  }

  /* ---------- принципы: плёнка вместо карточек ----------
     Тильда по-прежнему двигает свои карточки при скролле; мы их прячем и каждый кадр
     ставим на их место плёнку с кадрами и подписи на листе бумаги. */
  var FILM_REC = '#rec4193908101';
  var FILM_CARDS = [
    { g: '1771257201668000011', inner: '1771257201668000013', title: '1771257201668000012', text: '1771257201668000014' },
    { g: '1771267095633000005', inner: '1771267095633000007', title: '1771267095633000006', text: '1771267095634000008' },
    { g: '1771266918902000001', inner: '1771266918903000003', title: '1771266918903000002', text: '1771266918904000004', marks: [['oval', 'официально'], ['line', 'остаюсь на связи']] },
    { g: '1771267294117000009', inner: '1771267294117000011', title: '1771267294117000010', text: '1771267294117000012' },
    { g: '1771256860735000001', inner: '1771256943882000010', title: '1771256903533000009', text: '1771256860735000002', marks: [['oval', 'план съёмки'], ['line', 'весёлые моменты']] }
  ];
  var film = null;
  function filmEls(c, rec) {
    return {
      g: rec.querySelector('[data-group-id="' + c.g + '"]'),
      inner: rec.querySelector('[data-group-id="' + c.inner + '"]'),
      title: el(c.title, rec), text: el(c.text, rec), vec: c.vec ? el(c.vec, rec) : null
    };
  }
  function copyFont(from, to, z) {
    var cs = getComputedStyle(from);
    to.style.fontFamily = cs.fontFamily; to.style.fontWeight = cs.fontWeight;
    to.style.fontSize = parseFloat(cs.fontSize) * z + 'px';
    to.style.lineHeight = (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2) * z + 'px';
    var ls = parseFloat(cs.letterSpacing); to.style.letterSpacing = (isNaN(ls) ? 0 : ls * z) + 'px';
  }
  function holesMask(tw, th, reb, hw, hh, hy) {
    // плитка шириной в шаг перфорации: всё непрозрачно, кроме двух отверстий
    var x = (tw - hw) / 2, r = Math.min(hw, hh) * 0.18;
    var hole = function (y) { return '<rect x="' + x.toFixed(2) + '" y="' + y.toFixed(2) + '" width="' + hw.toFixed(2) + '" height="' + hh.toFixed(2) + '" rx="' + r.toFixed(2) + '" fill="black"/>'; };
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + tw.toFixed(2) + '" height="' + th.toFixed(2) + '"><mask id="m"><rect width="100%" height="100%" fill="white"/>' +
      hole(hy) + hole(th - hy - hh) + '</mask><rect width="100%" height="100%" fill="black" mask="url(#m)"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }
  // рукописная пометка вокруг или под фразой в тексте: овал по рамке слова, линия под каждой строкой
  var markData = {};
  function phraseRects(root, phrase) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [], text = '', n;
    while ((n = walker.nextNode())) { nodes.push([n, text.length]); text += n.data; }
    var re = new RegExp(phrase.split(' ').map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('[\\s\\u00a0]*'));
    var mt = re.exec(text); if (!mt) return [];
    var i = mt.index, rg = document.createRange(), j = i + mt[0].length;
    nodes.forEach(function (p) {
      var s0 = p[1], s1 = p[1] + p[0].data.length;
      if (i >= s0 && i <= s1) rg.setStart(p[0], i - s0);
      if (j >= s0 && j <= s1) rg.setEnd(p[0], j - s0);
    });
    var lines = [];
    Array.prototype.forEach.call(rg.getClientRects(), function (r) {
      if (r.width < 2) return;
      var l = lines.find(function (x) { return Math.abs(x.top - r.top) < r.height / 2; });
      if (l) { l.left = Math.min(l.left, r.left); l.right = Math.max(l.right, r.right); l.bottom = Math.max(l.bottom, r.bottom); }
      else lines.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom });
    });
    return lines;
  }
  function drawMark(tx, kind, phrase) {
    var m = markData[kind === 'oval' ? 'images/hand-oval-1.svg' : 'images/hand-underline-1.svg']; if (!m) return;
    var base = tx.getBoundingClientRect();
    phraseRects(tx, phrase).forEach(function (r, k) {
      var svg = document.createElementNS(SVGNS, 'svg'), x, y, w, h;
      if (kind === 'oval') { x = r.left - 8; y = r.top - 7; w = r.right - r.left + 16; h = r.bottom - r.top + 12; }
      else { x = r.left - 2; y = r.bottom - 3; w = r.right - r.left + 4; h = 7; }
      svg.setAttribute('viewBox', m.vb.join(' ')); svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('class', 'vs-film-mark');
      svg.style.left = (x - base.left) + 'px'; svg.style.top = (y - base.top) + 'px';
      svg.style.width = w + 'px'; svg.style.height = h + 'px';
      if (kind === 'line' && k % 2) svg.style.transform = 'scaleX(-1)';
      markPaths(svg, m); tx.appendChild(svg);
    });
  }
  function buildFilm() {
    var rec = $(FILM_REC); if (!rec) return;
    var E = FILM_CARDS.map(function (c) { return filmEls(c, rec); });
    if (E.some(function (e) { return !e.g || !e.inner || !e.text || !e.title; })) return;
    var r0 = E[0].inner.getBoundingClientRect(), r1 = E[1].inner.getBoundingClientRect();
    if (!r0.width) return;
    var z = zoomOf(E[0].inner), P = r1.left - r0.left, u = r0.width / 302;
    var N = E.length, gap = 17 * u, iw = P - gap, ih = iw * 2 / 3, reb = 44 * u, FH = ih + 2 * reb;
    var lead = 0.35 * P, x0 = -gap / 2 - lead, x1 = (N - 1) * P + iw + gap / 2 + 0.25 * P;
    var sheetTop = -150 * u, stripTop = sheetTop + 20 * u;

    if (film) film.root.remove();
    var root = document.createElement('div'); root.id = 'vs-film';
    var sheet = document.createElement('div'); sheet.className = 'vs-film-sheet';
    var strip = document.createElement('div'); strip.className = 'vs-film-strip';
    root.appendChild(sheet); root.appendChild(strip);
    strip.style.left = x0 + 'px'; strip.style.top = stripTop + 'px';
    strip.style.width = (x1 - x0) + 'px'; strip.style.height = FH + 'px';
    var pitch = P / 8, hw = 23 * u, hh = 16 * u, hy = 10 * u;
    var m = holesMask(pitch, FH, reb, hw, hh, hy);
    strip.style.webkitMaskImage = m; strip.style.maskImage = m;
    strip.style.webkitMaskSize = pitch + 'px ' + FH + 'px'; strip.style.maskSize = pitch + 'px ' + FH + 'px';
    strip.style.webkitMaskPosition = (((-x0 - gap / 2) % pitch) - pitch / 2) + 'px 0';
    strip.style.maskPosition = strip.style.webkitMaskPosition;
    var fs = Math.max(7, 8.5 * u);
    // надписи по краю плёнки
    for (var k = -1; k <= N; k++) {
      var fx = k * P - gap / 2 - x0, n = 14 + k;
      var a = document.createElement('span'); a.className = 'vs-film-edge';
      a.textContent = '▸' + n; a.style.left = (fx + 6 * u) + 'px'; a.style.top = (FH - reb + 4 * u) + 'px'; a.style.fontSize = fs + 'px';
      var b = document.createElement('span'); b.className = 'vs-film-edge';
      b.textContent = n + 'A'; b.style.left = (fx + P / 2) + 'px'; b.style.top = (FH - reb + 4 * u) + 'px'; b.style.fontSize = fs + 'px';
      strip.appendChild(a); strip.appendChild(b);
      if (k % 2 === 0) {
        var t = document.createElement('span'); t.className = 'vs-film-edge';
        t.textContent = 'VS 400   ' + (5063 + k); t.style.left = (fx + P * 0.3) + 'px'; t.style.top = (reb - 4 * u - fs) + 'px'; t.style.fontSize = fs + 'px';
        strip.appendChild(t);
      }
    }
    E.forEach(function (e, i) {
      var fr = document.createElement('div'); fr.className = 'vs-film-frame';
      fr.style.left = (i * P - x0 - gap / 2 + gap / 2) + 'px'; fr.style.top = reb + 'px';
      fr.style.width = iw + 'px'; fr.style.height = ih + 'px';
      fr.style.backgroundImage = 'url(images/film/frame-' + (i + 1) + '.jpg)';
      strip.appendChild(fr);

      var cap = document.createElement('div'); cap.className = 'vs-film-cap';
      cap.style.left = (i * P - gap / 2 + gap / 2) + 'px'; cap.style.top = (stripTop + FH + 18 * u) + 'px'; cap.style.width = iw + 'px';
      var h = document.createElement('div'); h.className = 'vs-film-title';
      var num = document.createElement('span'); num.className = 'vs-film-num'; num.textContent = String(14 + i);
      num.style.fontSize = 11 * u + 'px';
      var ta = e.title.querySelector('.tn-atom'), tt = document.createElement('span');
      tt.textContent = ta.textContent.trim(); copyFont(ta, tt, zoomOf(e.title));
      h.appendChild(num); h.appendChild(tt); cap.appendChild(h);
      var xa = e.text.querySelector('.tn-atom'), tx = document.createElement('div'); tx.className = 'vs-film-text';
      tx.innerHTML = xa.innerHTML; copyFont(xa, tx, zoomOf(e.text));
      var trc = e.text.getBoundingClientRect(); tx.style.width = trc.width + 'px';
      cap.appendChild(tx);
      tx._marks = FILM_CARDS[i].marks;
      if (false) {
        var vr = e.vec.getBoundingClientRect(), vc = document.createElement('div'); vc.className = 'vs-film-mark';
        vc.innerHTML = (e.vec.querySelector('.tn-atom') || e.vec).innerHTML;
        vc.style.left = (vr.left - trc.left) + 'px'; vc.style.top = (vr.top - trc.top) + 'px';
        vc.style.width = vr.width + 'px'; vc.style.height = vr.height + 'px';
        tx.appendChild(vc);
      }
      root.appendChild(cap);
      e.g.classList.add('vs-film-hide');
    });
    // отметка восковым карандашом, как на контактном листе
    var pick = document.createElement('div'); pick.className = 'vs-film-pick';
    pick.style.left = (2 * P - 9 * u) + 'px'; pick.style.top = (stripTop + reb - 9 * u) + 'px';
    pick.style.width = (iw + 18 * u) + 'px'; pick.style.height = (ih + 18 * u) + 'px';
    pick.innerHTML = '<svg viewBox="0 0 100 66" preserveAspectRatio="none"><path d="M3 5 C 30 2, 70 3, 97 4 C 98 22, 97 45, 96 62 C 70 64, 32 63, 4 61 C 2 44, 3 22, 4 3" fill="none" class="vs-mk"/></svg>';
    root.appendChild(pick);
    var capH = 0; root.querySelectorAll('.vs-film-cap').forEach(function (c) { capH = Math.max(capH, c.offsetHeight); });
    var board = rec.querySelector('.t396__artboard') || rec; board.appendChild(root); // артборд обрезает плёнку за пределами блока
    root.querySelectorAll('.vs-film-cap').forEach(function (c) { capH = Math.max(capH, c.offsetHeight); });
    root.querySelectorAll('.vs-film-text').forEach(function (tx) { (tx._marks || []).forEach(function (mk) { drawMark(tx, mk[0], mk[1]); }); });
    sheet.style.left = (x0 - 0.2 * P) + 'px'; sheet.style.width = (x1 - x0 + 0.35 * P) + 'px';
    sheet.style.top = sheetTop + 'px'; sheet.style.height = (stripTop - sheetTop + FH + 18 * u + capH + 34 * u) + 'px';
    if (getComputedStyle(rec).position === 'static') rec.style.position = 'relative';
    film = { root: root, rec: board, anchor: E[0].inner };
    filmTrack();
  }
  function filmTrack() {
    if (!film) return;
    var a = film.anchor.getBoundingClientRect(), r = film.rec.getBoundingClientRect();
    film.root.style.transform = 'translate3d(' + (a.left - r.left) + 'px,' + (a.top - r.top) + 'px,0)';
  }
  function initFilm() {
    var loop = function () { filmTrack(); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  /* ---------- рукописные линии: все подчёркивания, овалы и стрелки одной толщины ----------
     Файлы hand-*.svg вставлены Тильдой картинками разного размера, поэтому линия везде разная.
     Встраиваем их векторами и задаём толщину в экранных пикселях. */
  var MARK_W = 1.6;
  var markSrc = {};
  function loadMark(url) {
    if (!markSrc[url]) markSrc[url] = fetch(url).then(function (r) { return r.text(); }).then(function (t) {
      var d = new DOMParser().parseFromString(t, 'image/svg+xml').documentElement;
      var vb = (d.getAttribute('viewBox') || '0 0 ' + d.getAttribute('width') + ' ' + d.getAttribute('height')).split(/[\s,]+/).map(Number);
      return (markData[url] = { vb: vb, paths: Array.prototype.map.call(d.querySelectorAll('path'), function (p) { return p.getAttribute('d'); }) });
    });
    return markSrc[url];
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function markPaths(parent, m) {
    m.paths.forEach(function (d) {
      var p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', d); p.setAttribute('class', 'vs-mk');
      parent.appendChild(p);
    });
  }
  function initMarks() {
    var jobs = [];
    $$('svg image').forEach(function (img) {
      var href = img.getAttribute('href') || img.getAttribute('xlink:href') || '';
      if (!/hand-[a-z0-9-]+\.svg/.test(href)) return;
      jobs.push(loadMark(href).then(function (m) {
        var x = +img.getAttribute('x') || 0, y = +img.getAttribute('y') || 0, w = +img.getAttribute('width'), h = +img.getAttribute('height');
        var vw = m.vb[2], vh = m.vb[3], k = Math.max(w / vw, h / vh);
        var g = document.createElementNS(SVGNS, 'g');
        g.setAttribute('transform', 'translate(' + (x + (w - vw * k) / 2 - m.vb[0] * k) + ' ' + (y + (h - vh * k) / 2 - m.vb[1] * k) + ') scale(' + k + ')');
        markPaths(g, m);
        img.parentNode.replaceChild(g, img);
        var svg = g.ownerSVGElement; if (svg) svg.style.overflow = 'visible';
      }));
    });
    $$('.tn-atom.t-bgimg').forEach(function (a) {
      var u = (a.getAttribute('data-original') || '') + ' ' + a.style.backgroundImage;
      var mm = u.match(/images\/hand-[a-z0-9-]+\.svg/); if (!mm) return;
      jobs.push(loadMark(mm[0]).then(function (m) {
        a.style.setProperty('background-image', 'none', 'important');
        var svg = document.createElementNS(SVGNS, 'svg');
        svg.setAttribute('viewBox', m.vb.join(' ')); svg.setAttribute('class', 'vs-mk-svg');
        markPaths(svg, m); a.appendChild(svg);
      }));
    });
    jobs.push(loadMark('images/hand-oval-1.svg'), loadMark('images/hand-underline-1.svg'));
    return Promise.all(jobs).then(markWidths);
  }
  // толщина задаётся до зума Тильды: делим на зум, чтобы на экране было ровно MARK_W
  function markWidths() {
    $$('.t396__elem').forEach(function (e) {
      if (e.querySelector('.vs-mk')) e.style.setProperty('--vs-mk-w', (MARK_W / zoomOf(e)).toFixed(3) + 'px');
    });
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
    try { alignStars(); alignPrices(); } catch (e) { console.warn(e); }
    try { alignStages(); } catch (e) { console.warn(e); }
    try { markWidths(); buildFilm(); } catch (e) { console.warn(e); }
    try { logoMeasure(); } catch (e) { console.warn(e); }
  }
  var timer;
  function relayout() { clearTimeout(timer); timer = setTimeout(layout, 180); }
  // ручные переносы в абзацах мешали типографике: строки переносит браузер, с неразрывными пробелами
  function unbreak() {
    $$('.tn-atom').forEach(function (a) {
      if (!a.querySelector('br') || !/Source Code/.test(getComputedStyle(a).fontFamily)) return;
      $$('br', a).forEach(function (br) { br.replaceWith(document.createTextNode(' ')); });
    });
  }
  function start() {
    unbreak();
    cleanMenus();
    layout();
    collectPhotos();
    initViewfinder();
    initServiceHover();
    initFilm();
    initMarks().then(function () { try { buildFilm(); } catch (e) { console.warn(e); } });
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
