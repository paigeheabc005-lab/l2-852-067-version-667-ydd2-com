import { H as Hls } from './hls.js';

var players = document.querySelectorAll('.player-shell');

function bindPlayer(shell) {
    var video = shell.querySelector('video');
    var layer = shell.querySelector('.play-layer');

    if (!video) {
        return;
    }

    var stream = video.getAttribute('data-stream');

    function attachStream() {
        if (!stream || video.getAttribute('data-ready') === '1') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
        } else if (Hls && Hls.isSupported()) {
            var hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            video._hls = hls;
        } else {
            video.src = stream;
        }

        video.setAttribute('data-ready', '1');
    }

    function startPlayback() {
        attachStream();
        if (layer) {
            layer.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (layer) {
        layer.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        }
    });
}

players.forEach(bindPlayer);
