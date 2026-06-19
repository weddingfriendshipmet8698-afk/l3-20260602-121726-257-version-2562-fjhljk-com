function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var streamUrl = options.streamUrl;
    var hlsInstance = null;
    var prepared = false;

    function showMessage(text) {
        var shell = video ? video.parentElement : null;
        if (!shell) {
            return;
        }
        var old = shell.querySelector(".player-message");
        if (old) {
            old.remove();
        }
        var message = document.createElement("div");
        message.className = "player-message";
        message.textContent = text;
        shell.appendChild(message);
        window.setTimeout(function () {
            message.remove();
        }, 3600);
    }

    function prepare() {
        if (prepared || !video || !streamUrl) {
            return;
        }
        prepared = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (data && data.fatal) {
                    showMessage("视频加载遇到问题，请稍后重试");
                }
            });
            return;
        }
        video.src = streamUrl;
    }

    function start() {
        if (!video) {
            return;
        }
        prepare();
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
                showMessage("点击播放按钮即可开始观看");
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }
    if (button) {
        button.addEventListener("click", start);
    }
    if (video) {
        video.addEventListener("click", function () {
            if (video.paused) {
                start();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("pause", function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove("is-hidden");
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
