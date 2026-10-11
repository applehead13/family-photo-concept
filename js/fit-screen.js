/* Первый экран и подвал с контактами всегда помещаются в окно по высоте.
   Tilda масштабирует Zero Block только по ширине окна, поэтому на широких и невысоких
   экранах (ноутбук 1536×730 и т. п.) нижняя часть блока уходила за край.
   Здесь коэффициент масштаба ограничивается ещё и высотой окна.
   Числа — высота содержимого блока в исходных единицах для каждой сетки (1200/768/360). */
(function () {
  var CONTENT = {
    '4193905301': { 1200: 636, 768: 600, 360: 600 }, // первый экран
    '2340804781': { 1200: 575, 768: 550, 360: 606 }  // подвал с контактами
  };
  // цвет полей по бокам уменьшенного блока
  var FILL = { '4193905301': '#aec3da' };

  window.fitScreenCap = function (recid, screen, factor) {
    var block = CONTENT[String(recid)];
    var base = block && block[screen];
    if (!base) return factor;
    var byHeight = document.documentElement.clientHeight / base;
    var capped = byHeight < factor;
    var result = capped ? parseFloat(byHeight.toFixed(3)) : factor;
    narrow(recid, capped ? Math.floor(screen * result) : 0);
    return result;
  };

  // Уменьшенный блок уже окна: сужаем artboard до ширины сетки и ставим по центру,
  // тогда расчёт Tilda «50% − половина сетки» снова даёт выравнивание по центру
  function narrow(recid, width) {
    var rec = document.getElementById('rec' + recid);
    var board = rec && rec.querySelector('.t396__artboard');
    if (!board) return;
    if (width) {
      board.style.setProperty('width', width + 'px', 'important');
      // минимальная высота блока из Tilda не даёт подвалу стать ниже окна
      [board, board.querySelector('.t396__carrier'), board.querySelector('.t396__filter')].forEach(function (el) {
        if (el) el.style.setProperty('min-height', '0', 'important');
      });
      board.style.setProperty('margin', '0 auto', 'important');
    } else {
      [board, board.querySelector('.t396__carrier'), board.querySelector('.t396__filter')].forEach(function (el) {
        if (el) el.style.removeProperty('min-height');
      });
      board.style.removeProperty('width');
      board.style.removeProperty('margin');
    }
    rec.style.backgroundColor = width ? FILL[recid] || '' : '';
  }
})();
