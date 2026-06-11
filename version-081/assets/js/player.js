(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll('[data-player-panel]').forEach(function (panel) {
      var video = panel.querySelector('[data-player]');
      var button = panel.querySelector('[data-play-control]');

      if (!video) {
        return;
      }

      var stream = video.getAttribute('data-stream');
      var hls = null;

      if (stream && window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (stream && video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      }

      function start() {
        panel.classList.add('is-playing');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            panel.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener('play', function () {
        panel.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          panel.classList.remove('is-playing');
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
