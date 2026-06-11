(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        play();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    show(0);
    play();
  }

  var filterRoot = document.querySelector('[data-filter-root]');
  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var region = filterRoot.querySelector('[data-filter-region]');
    var type = filterRoot.querySelector('[data-filter-type]');
    var year = filterRoot.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var empty = document.querySelector('[data-no-results]');
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q && input) {
      input.value = q;
    }

    function norm(value) {
      return String(value || '').trim().toLowerCase();
    }

    function runFilter() {
      var keyword = norm(input && input.value);
      var regionValue = norm(region && region.value);
      var typeValue = norm(type && type.value);
      var yearValue = norm(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = norm([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' '));
        var ok = true;
        if (keyword && haystack.indexOf(keyword) === -1) ok = false;
        if (regionValue && norm(card.getAttribute('data-region')).indexOf(regionValue) === -1) ok = false;
        if (typeValue && norm(card.getAttribute('data-type')).indexOf(typeValue) === -1) ok = false;
        if (yearValue && norm(card.getAttribute('data-year')) !== yearValue) ok = false;
        card.style.display = ok ? '' : 'none';
        if (ok) visible += 1;
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, region, type, year].forEach(function (el) {
      if (el) {
        el.addEventListener('input', runFilter);
        el.addEventListener('change', runFilter);
      }
    });

    runFilter();
  }
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var overlay = document.getElementById('play-overlay');
  if (!video || !streamUrl) return;

  var loaded = false;
  var hls = null;

  function attach() {
    if (loaded) return;
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function start() {
    attach();
    if (overlay) overlay.classList.add('is-hidden');
    video.setAttribute('controls', 'controls');
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', start);
  }

  video.addEventListener('click', function () {
    if (video.paused) start();
  });

  video.addEventListener('play', function () {
    if (overlay) overlay.classList.add('is-hidden');
  });
}
