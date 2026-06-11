(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    initHero();
    initFilters();
  });

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var sideItems = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-side]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
      sideItems.forEach(function (item, i) {
        item.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    sideItems.forEach(function (item, i) {
      item.addEventListener("mouseenter", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }

    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";

    if (input && query) {
      input.value = query;
    }

    function filter() {
      var value = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-text") || "").toLowerCase();
        var title = (card.getAttribute("data-title") || "").toLowerCase();
        var visible = !value || text.indexOf(value) !== -1 || title.indexOf(value) !== -1;
        card.classList.toggle("is-hidden", !visible);
      });
    }

    function sort() {
      if (!select) {
        return;
      }
      var mode = select.value;
      var sorted = cards.slice().sort(function (a, b) {
        if (mode === "title") {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        }
        if (mode === "heat") {
          return Number(b.getAttribute("data-heat") || 0) - Number(a.getAttribute("data-heat") || 0);
        }
        return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
      });
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", filter);
    }
    if (select) {
      select.addEventListener("change", sort);
    }
    sort();
    filter();
  }

  window.initMoviePlayer = function (source) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("videoCoverButton");
    var message = document.getElementById("playerMessage");
    if (!video || !button || !source) {
      return;
    }

    var loaded = false;
    var hlsInstance = null;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
      window.setTimeout(function () {
        message.classList.remove("is-visible");
      }, 3600);
    }

    function attach() {
      if (loaded) {
        return true;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        loaded = true;
        return true;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("播放暂时不可用，请稍后重试");
          }
        });
        loaded = true;
        return true;
      }
      video.src = source;
      loaded = true;
      return true;
    }

    function play() {
      attach();
      button.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.classList.remove("is-hidden");
          showMessage("点击播放器开始播放");
        });
      }
    }

    button.addEventListener("click", function () {
      play();
    });

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });

    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        button.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
