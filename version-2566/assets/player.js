document.addEventListener("DOMContentLoaded", function () {
  var card = document.querySelector(".player-card");
  if (!card) {
    return;
  }
  var video = card.querySelector("video");
  var button = card.querySelector(".play-layer");
  var source = card.getAttribute("data-video-url");
  var started = false;
  var start = function () {
    if (!video || !source) {
      return;
    }
    if (!started) {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      started = true;
    }
    if (button) {
      button.classList.add("hidden");
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  };
  if (button) {
    button.addEventListener("click", start);
  }
  video.addEventListener("click", function () {
    if (!started || video.paused) {
      start();
    }
  });
});
