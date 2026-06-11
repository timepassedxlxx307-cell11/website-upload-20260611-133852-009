(function () {
  function rootPrefix() {
    return document.body.getAttribute("data-root") || "";
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupForms() {
    var forms = document.querySelectorAll("[data-search-form]");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var url = rootPrefix() + "search.html";
        if (value) {
          url += "?q=" + encodeURIComponent(value);
        }
        window.location.href = url;
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = next;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show((index + 1) % slides.length);
    }, 5200);
  }

  function setupPlayer() {
    var host = document.querySelector("[data-video-url]");
    if (!host) {
      return;
    }
    var url = host.getAttribute("data-video-url");
    var video = host.querySelector("video");
    var cover = host.querySelector(".play-cover");
    var loaded = false;
    var hlsInstance = null;
    function loadAndPlay() {
      if (!video || !url) {
        return;
      }
      if (!loaded) {
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls();
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
        } else {
          video.src = url;
        }
        loaded = true;
      }
      host.classList.add("is-playing");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener("click", loadAndPlay);
    }
    video.addEventListener("click", function () {
      if (!loaded) {
        loadAndPlay();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  }

  function createResult(item) {
    var article = document.createElement("article");
    article.className = "compact-row";
    var cover = document.createElement("a");
    cover.className = "compact-cover";
    cover.href = item.url;
    cover.style.setProperty("--poster-image", "url('" + item.image + "')");
    var year = document.createElement("span");
    year.textContent = item.year;
    cover.appendChild(year);
    var box = document.createElement("div");
    box.className = "compact-info";
    var title = document.createElement("h3");
    var link = document.createElement("a");
    link.href = item.url;
    link.textContent = item.title;
    title.appendChild(link);
    var desc = document.createElement("p");
    desc.textContent = item.oneLine;
    var meta = document.createElement("div");
    meta.className = "compact-meta";
    [item.region, item.type, item.genre].forEach(function (text) {
      var span = document.createElement("span");
      span.textContent = text;
      meta.appendChild(span);
    });
    var strong = document.createElement("strong");
    strong.textContent = "热度 " + item.score;
    meta.appendChild(strong);
    box.appendChild(title);
    box.appendChild(desc);
    box.appendChild(meta);
    article.appendChild(cover);
    article.appendChild(box);
    return article;
  }

  function setupSearchPage() {
    if (document.body.getAttribute("data-page") !== "search") {
      return;
    }
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    if (!results || !window.SITE_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector(".search-panel input[name='q']");
    if (input) {
      input.value = query;
    }
    if (!query) {
      results.innerHTML = "";
      return;
    }
    var lower = query.toLowerCase();
    var matched = window.SITE_MOVIES.filter(function (item) {
      return item.searchText.indexOf(lower) !== -1;
    }).slice(0, 120);
    if (title) {
      title.textContent = "搜索“" + query + "”得到 " + matched.length + " 条结果";
    }
    if (!matched.length) {
      results.innerHTML = "<p>没有找到匹配影片，请更换关键词。</p>";
      return;
    }
    results.innerHTML = "";
    matched.forEach(function (item) {
      results.appendChild(createResult(item));
    });
  }

  setupMenu();
  setupForms();
  setupHero();
  setupPlayer();
  setupSearchPage();
})();
