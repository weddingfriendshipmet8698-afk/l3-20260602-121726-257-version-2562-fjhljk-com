document.addEventListener('DOMContentLoaded', function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-player-card]'));

  cards.forEach(function (card) {
    var video = card.querySelector('video[data-video-url]');
    var startButton = card.querySelector('[data-player-start]');

    if (!video) {
      return;
    }

    var sourceUrl = video.getAttribute('data-video-url');
    var isReady = false;

    function preparePlayer() {
      if (isReady || !sourceUrl) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);

        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            console.warn('HLS playback error:', data.type);
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
      } else {
        video.src = sourceUrl;
      }

      isReady = true;
    }

    function playVideo() {
      preparePlayer();

      if (startButton) {
        startButton.classList.add('is-hidden');
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (startButton) {
            startButton.classList.remove('is-hidden');
          }
        });
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (startButton) {
        startButton.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && startButton) {
        startButton.classList.remove('is-hidden');
      }
    });

    video.addEventListener('loadedmetadata', function () {
      isReady = true;
    });
  });
});
