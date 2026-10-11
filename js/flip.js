/* Переворот карточек: замена мода flip из cdn.postnikovmd.com/tilda@1.6/mods.min.js.
   Лицевая сторона — группа Zero Block с классом uc-flip, оборот — группа uc-flip-back на том же месте.
   Наведение на десктопе и тап на сенсорных экранах переворачивают карточку. */
(function () {
  var DURATION = 600;
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

  function face(group) {
    return group.querySelector('.tn-molecule') || group;
  }

  // backface-visibility не срабатывает на вложенных элементах Zero Block,
  // поэтому сторона скрывается прозрачностью ровно на середине поворота
  // ease-in-out симметричен: 90° приходится ровно на середину, где меняется прозрачность
  function prepare(el, angle, visible) {
    el.style.transition = 'transform ' + DURATION + 'ms ease-in-out, opacity 0s linear ' + (DURATION / 2) + 'ms';
    show(el, angle, visible);
  }

  function show(el, angle, visible) {
    el.style.transform = 'perspective(1000px) rotateY(' + angle + 'deg)';
    el.style.opacity = visible ? '1' : '0';
  }

  function center(el) {
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function findBack(front, backs) {
    var c = center(front), best = null, bestD = Infinity;
    backs.forEach(function (b) {
      var d = center(b), dist = Math.abs(d.x - c.x) + Math.abs(d.y - c.y);
      if (dist < bestD) { bestD = dist; best = b; }
    });
    return best;
  }

  function init(selector) {
    var fronts = Array.prototype.slice.call(document.querySelectorAll(selector));
    var backs = Array.prototype.slice.call(document.querySelectorAll(selector + '-back'));
    if (!fronts.length || !backs.length) return;

    fronts.forEach(function (front) {
      var back = null, flipped = false;
      function pair() {
        if (back) return true;
        back = findBack(front, backs);
        if (!back) return false;
        prepare(face(front), 0, true);
        prepare(face(back), 180, false);
        return true;
      }
      function set(state) {
        if (!pair() || state === flipped) return;
        flipped = state;
        show(face(front), state ? -180 : 0, !state);
        show(face(back), state ? 0 : 180, state);
      }
      front.style.cursor = 'pointer';
      if (canHover) {
        front.addEventListener('mouseenter', function () { set(true); });
        front.addEventListener('mouseleave', function (e) {
          if (back && back.contains(e.relatedTarget)) return;
          set(false);
        });
        // оборот лежит под лицевой стороной; уход курсора с него тоже возвращает карточку
        setTimeout(function () {
          if (!pair()) return;
          back.addEventListener('mouseleave', function (e) {
            if (front.contains(e.relatedTarget)) return;
            set(false);
          });
        }, 0);
      } else {
        front.addEventListener('click', function () { set(!flipped); });
        setTimeout(function () {
          if (pair()) back.addEventListener('click', function () { set(!flipped); });
        }, 0);
      }
    });
  }

  window.flip = { init: init };
})();
