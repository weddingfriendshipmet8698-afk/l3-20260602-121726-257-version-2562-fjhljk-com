document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var button = player.querySelector("[data-play-button]");
    var video = player.querySelector("video");
    var message = player.querySelector("[data-player-message]");
    var source = player.getAttribute("data-source");
    var initialized = false;

    function setMessage(text) {
      if (message) {
        message.textContent = text || "";
      }
    }

    function initialize() {
      if (initialized || !video || !source) {
        return;
      }

      initialized = true;
      setMessage("正在初始化播放源...");

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        player.classList.add("is-ready");
        setMessage("");
        video.play().catch(function () {
          setMessage("播放器已准备，请点击视频继续播放。");
        });
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          player.classList.add("is-ready");
          setMessage("");
          video.play().catch(function () {
            setMessage("播放器已准备，请点击视频继续播放。");
          });
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setMessage("播放源加载失败，请刷新页面后重试。");
          }
        });
        return;
      }

      video.src = source;
      player.classList.add("is-ready");
      setMessage("当前浏览器不支持 HLS 自动解码，可尝试使用 Safari 或新版浏览器打开。");
    }

    if (button) {
      button.addEventListener("click", initialize);
    }

    if (video) {
      video.addEventListener("play", initialize, { once: true });
    }
  });
});
