(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('is-open');
      });
    }

    document.querySelectorAll('.site-search').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        var term = input ? input.value.trim() : '';
        if (term) {
          event.preventDefault();
          var path = form.getAttribute('data-search-path') || form.getAttribute('action') || 'search.html';
          window.location.href = path + '?q=' + encodeURIComponent(term);
        }
      });
    });

    setupHero();
    setupFilters();
  });

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupFilters() {
    var panels = document.querySelectorAll('[data-filter-panel]');
    if (!panels.length) {
      return;
    }

    panels.forEach(function (panel) {
      var list = document.querySelector('[data-card-list]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
      var input = panel.querySelector('[data-filter-input]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var empty = document.querySelector('[data-empty-result]');
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q');

      if (initial && input) {
        input.value = initial;
      }

      function cardText(card) {
        return [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
      }

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;

        cards.forEach(function (card) {
          var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
          var matchesType = !typeValue || card.getAttribute('data-type') === typeValue;
          var matchesYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var show = matchesQuery && matchesType && matchesYear;

          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }

        if (list) {
          list.setAttribute('data-visible-count', String(visible));
        }
      }

      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      apply();
    });
  }
})();
