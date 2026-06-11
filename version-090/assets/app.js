(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  const hero = document.querySelector('.hero');
  if (hero) {
    const track = hero.querySelector('.hero-track');
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dots button'));
    const previous = hero.querySelector('.hero-control.prev');
    const next = hero.querySelector('.hero-control.next');
    let index = 0;
    let timer = null;

    const activate = function (nextIndex) {
      if (!slides.length || !track) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    };

    const start = function () {
      stop();
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    };

    const stop = function () {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    if (previous) {
      previous.addEventListener('click', function () {
        activate(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    activate(0);
    start();
  }

  const panels = Array.from(document.querySelectorAll('.search-panel'));
  panels.forEach(function (panel) {
    const input = panel.querySelector('.movie-search');
    const clear = panel.querySelector('.clear-search');
    const buttons = Array.from(panel.querySelectorAll('[data-filter]'));
    const scope = panel.parentElement || document;
    const cards = Array.from(scope.querySelectorAll('.movie-card, .rank-item'));
    let activeFilter = 'all';

    const normalize = function (value) {
      return String(value || '').toLowerCase().trim();
    };

    const apply = function () {
      const term = normalize(input ? input.value : '');
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));

        const textMatch = !term || haystack.indexOf(term) !== -1;
        const filterMatch = activeFilter === 'all' || haystack.indexOf(normalize(activeFilter)) !== -1;
        const show = textMatch && filterMatch;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      const empty = scope.querySelector('.empty-state');
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (clear) {
      clear.addEventListener('click', function () {
        if (input) {
          input.value = '';
        }
        activeFilter = 'all';
        buttons.forEach(function (button) {
          button.classList.toggle('active', button.getAttribute('data-filter') === 'all');
        });
        apply();
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeFilter = button.getAttribute('data-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });
  });

  Array.from(document.querySelectorAll('.player-shell')).forEach(function (shell) {
    const video = shell.querySelector('video[data-stream]');
    const overlay = shell.querySelector('.play-overlay');
    let loaded = false;
    let hlsPlayer = null;

    const loadStream = function () {
      if (!video || loaded) {
        return;
      }
      const stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(stream);
        hlsPlayer.attachMedia(video);
      } else {
        video.src = stream;
      }
      loaded = true;
    };

    const play = function () {
      loadStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      const result = video.play();
      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    };

    if (overlay && video) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!loaded) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
    }
  });
})();
