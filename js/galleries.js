/* Галереи историй: кадры, которые открываются по клику на фото в портфолио */
(function () {
  function shoot(dir, n) {
    var p = [], t = [];
    for (var i = 1; i <= n; i++) {
      var k = (i < 10 ? '0' : '') + i;
      p.push('images/gallery/' + dir + '/' + k + '.jpg');
      t.push('images/gallery/' + dir + '/' + k + '-t.jpg');
    }
    return { photos: p, thumbs: t };
  }
  function g(title, meta, dir, n) { var s = shoot(dir, n); s.title = title; s.meta = meta; return s; }
  window.VS_GALLERIES = [
    g('Утро дома', 'Дом/2026', '01-home', 9),
    g('У бабушки', 'Семья/2025-2026', '02-grandma', 8),
    g('Ждём Мишу', 'Беременность/2025', '04-pregnancy', 7),
    g('Привет, Лёва', 'Новорождённые/2025', '03-newborn', 9),
    g('Мы и Бублик', 'Прогулка/2026', '05-dog', 5)
  ];
})();
