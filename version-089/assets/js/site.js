(function () {
    function each(selector, callback) {
        document.querySelectorAll(selector).forEach(callback);
    }

    function setupNavigation() {
        var toggle = document.querySelector(".nav-toggle");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("menu-open");
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var activeIndex = 0;
        function activate(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === activeIndex);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === activeIndex);
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
            });
        });
        setInterval(function () {
            activate(activeIndex + 1);
        }, 5600);
    }

    function setupMovieFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var searchInput = document.querySelector(".movie-search-input");
        var selects = Array.prototype.slice.call(document.querySelectorAll(".movie-filter-select"));
        var empty = document.querySelector(".empty-result");
        if (!cards.length || (!searchInput && !selects.length)) {
            return;
        }
        function filterCards() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var filterValues = {};
            selects.forEach(function (select) {
                filterValues[select.getAttribute("data-filter")] = select.value;
            });
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-category")
                ].join(" ").toLowerCase();
                var matched = true;
                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                Object.keys(filterValues).forEach(function (key) {
                    var value = filterValues[key];
                    if (value && String(card.getAttribute("data-" + key) || "").indexOf(value) === -1) {
                        matched = false;
                    }
                });
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        if (searchInput) {
            searchInput.addEventListener("input", filterCards);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", filterCards);
        });
    }

    function initMoviePlayer(videoId, videoUrl) {
        var video = document.getElementById(videoId);
        if (!video) {
            return;
        }
        var shell = video.closest(".player-shell");
        var cover = shell ? shell.querySelector(".player-cover") : null;
        var prepared = false;
        function prepare() {
            if (!prepared) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = videoUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource(videoUrl);
                    hls.attachMedia(video);
                    video.hls = hls;
                } else {
                    video.src = videoUrl;
                }
                prepared = true;
            }
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }
        if (cover) {
            cover.addEventListener("click", prepare);
        }
        video.addEventListener("click", function () {
            if (!prepared) {
                prepare();
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupNavigation();
        setupHeroSlider();
        setupMovieFilters();
    });

    window.MoviePlayer = {
        init: initMoviePlayer
    };
})();
