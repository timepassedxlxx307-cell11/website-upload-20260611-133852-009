import { H as Hls } from './hls-dru42stk.js';

const normalize = (value) => String(value || '').trim().toLowerCase();

function setupMobileMenu() {
  const button = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-mobile-nav]');

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function setupHeroCarousel() {
  const carousel = document.querySelector('[data-hero-carousel]');

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(carousel.querySelectorAll('.hero-dot'));

  if (slides.length <= 1) {
    return;
  }

  let index = 0;

  const activate = (nextIndex) => {
    index = nextIndex % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === index);
    });
  };

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => activate(dotIndex));
  });

  window.setInterval(() => activate(index + 1), 5200);
}

function cardMatches(card, query, category, year) {
  const haystack = normalize([
    card.dataset.title,
    card.dataset.category,
    card.dataset.genre,
    card.dataset.tags,
    card.dataset.year,
    card.dataset.region,
  ].join(' '));

  const matchesQuery = !query || haystack.includes(query);
  const matchesCategory = !category || category === 'all' || card.dataset.category === category;
  const matchesYear = !year || year === 'all' || card.dataset.year === year;

  return matchesQuery && matchesCategory && matchesYear;
}

function setupSearchPage() {
  const panel = document.querySelector('[data-search-panel]');

  if (!panel) {
    return;
  }

  const input = panel.querySelector('[data-search-input]');
  const category = panel.querySelector('[data-category-select]');
  const year = panel.querySelector('[data-year-select]');
  const count = panel.querySelector('[data-result-count]');
  const cards = Array.from(document.querySelectorAll('[data-movie-card]'));
  const params = new URLSearchParams(window.location.search);

  if (input && params.get('q')) {
    input.value = params.get('q');
  }

  const apply = () => {
    const query = normalize(input ? input.value : '');
    const selectedCategory = category ? category.value : 'all';
    const selectedYear = year ? year.value : 'all';
    let visible = 0;

    cards.forEach((card) => {
      const matched = cardMatches(card, query, selectedCategory, selectedYear);
      card.classList.toggle('hidden', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (count) {
      count.textContent = `当前显示 ${visible} 部影片`;
    }
  };

  [input, category, year].forEach((element) => {
    if (element) {
      element.addEventListener('input', apply);
      element.addEventListener('change', apply);
    }
  });

  panel.addEventListener('submit', (event) => {
    event.preventDefault();
    apply();
  });

  apply();
}

function setupLocalSearch() {
  const controls = Array.from(document.querySelectorAll('[data-local-search]'));

  controls.forEach((input) => {
    const scope = document.querySelector(input.dataset.localSearch || 'body');
    const cards = scope ? Array.from(scope.querySelectorAll('[data-movie-card]')) : [];
    const count = document.querySelector(input.dataset.localCount || '');

    const apply = () => {
      const query = normalize(input.value);
      let visible = 0;

      cards.forEach((card) => {
        const matched = cardMatches(card, query, 'all', 'all');
        card.classList.toggle('hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `当前显示 ${visible} 部影片`;
      }
    };

    input.addEventListener('input', apply);
    apply();
  });
}

function setupPlayers() {
  const players = Array.from(document.querySelectorAll('[data-player]'));

  players.forEach((shell) => {
    const video = shell.querySelector('video');
    const playButton = shell.querySelector('[data-play]');
    const lineButtons = Array.from(shell.querySelectorAll('[data-line-src]'));
    const status = shell.querySelector('[data-player-status]');
    let hlsInstance = null;

    if (!video || !playButton) {
      return;
    }

    const showStatus = (message) => {
      if (!status) {
        return;
      }

      status.textContent = message;
      status.classList.add('is-visible');
    };

    const clearStatus = () => {
      if (status) {
        status.textContent = '';
        status.classList.remove('is-visible');
      }
    };

    const destroyHls = () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    };

    const activateLine = (source) => {
      lineButtons.forEach((button) => {
        button.classList.toggle('is-active', button.dataset.lineSrc === source);
      });
    };

    const start = async (source) => {
      const stream = source || shell.dataset.src;

      if (!stream) {
        showStatus('当前条目没有可用播放线路。');
        return;
      }

      clearStatus();
      destroyHls();
      activateLine(stream);
      shell.classList.add('is-playing');

      try {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (Hls && Hls.isSupported()) {
          hlsInstance = new Hls({
            lowLatencyMode: true,
            backBufferLength: 60,
          });

          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(Hls.Events.ERROR, (eventName, data) => {
            if (data && data.fatal) {
              showStatus('播放线路连接失败，请切换线路或稍后重试。');
            }
          });
        } else {
          showStatus('当前浏览器暂不支持 HLS 播放，请更换浏览器或播放线路。');
          return;
        }

        await video.play();
      } catch (error) {
        showStatus('浏览器阻止了自动播放，请再次点击播放按钮。');
      }
    };

    playButton.addEventListener('click', () => start(shell.dataset.src));

    lineButtons.forEach((button) => {
      button.addEventListener('click', () => start(button.dataset.lineSrc));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupHeroCarousel();
  setupSearchPage();
  setupLocalSearch();
  setupPlayers();
});
