import { H as Hls } from './hls.js';

const setupPlayer = (shell) => {
  const video = shell.querySelector('video');
  const button = shell.querySelector('[data-play-button]');
  const stream = shell.dataset.stream;
  if (!video || !stream) return;

  let ready = false;
  const loadStream = () => {
    if (ready) return;
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  };

  const play = async () => {
    loadStream();
    shell.classList.add('playing');
    try {
      await video.play();
    } catch (error) {
      shell.classList.remove('playing');
    }
  };

  if (button) {
    button.addEventListener('click', play);
  }
  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', () => shell.classList.add('playing'));
  video.addEventListener('pause', () => {
    if (!video.ended) return;
    shell.classList.remove('playing');
  });
};

document.querySelectorAll('.player-shell').forEach(setupPlayer);
