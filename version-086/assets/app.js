(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function initMenu() {
        var button = document.querySelector(".mobile-menu-button");
        var panel = document.querySelector(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5200);
    }

    function initTopSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll(".site-search-form"));
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var q = input ? input.value.trim() : "";
                var target = "./search.html";
                if (q) {
                    target += "?q=" + encodeURIComponent(q);
                }
                window.location.href = target;
            });
        });
    }

    function initCatalog() {
        var input = document.querySelector(".catalog-search");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
        if (!cards.length) {
            return;
        }
        var active = "全部";
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        if (input && q) {
            input.value = q;
        }
        function normalize(text) {
            return String(text || "").toLowerCase().replace(/\s+/g, "");
        }
        function apply() {
            var keyword = normalize(input ? input.value : "");
            var chip = normalize(active);
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-filter") || "") + normalize(card.getAttribute("data-title") || "");
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okChip = active === "全部" || haystack.indexOf(chip) !== -1;
                card.classList.toggle("hidden-by-filter", !(okKeyword && okChip));
            });
        }
        if (input) {
            input.addEventListener("input", apply);
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                chips.forEach(function (item) {
                    item.classList.remove("active");
                });
                chip.classList.add("active");
                active = chip.getAttribute("data-filter-value") || "全部";
                apply();
            });
        });
        apply();
    }

    function initPlayer() {
        var shell = document.querySelector(".player-shell");
        var video = document.querySelector(".movie-video");
        var start = document.querySelector(".player-start");
        if (!shell || !video || !start) {
            return;
        }
        var started = false;
        function playVideo() {
            var src = video.getAttribute("data-url");
            if (!src) {
                return;
            }
            shell.classList.add("is-playing");
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    var nativePlay = video.play();
                    if (nativePlay && nativePlay.catch) {
                        nativePlay.catch(function () {});
                    }
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        var hlsPlay = video.play();
                        if (hlsPlay && hlsPlay.catch) {
                            hlsPlay.catch(function () {});
                        }
                    });
                } else {
                    video.src = src;
                    var fallbackPlay = video.play();
                    if (fallbackPlay && fallbackPlay.catch) {
                        fallbackPlay.catch(function () {});
                    }
                }
            } else {
                var playAgain = video.play();
                if (playAgain && playAgain.catch) {
                    playAgain.catch(function () {});
                }
            }
        }
        start.addEventListener("click", playVideo);
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                playVideo();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initTopSearch();
        initCatalog();
        initPlayer();
    });
})();
