(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function attachPlayer(container) {
        var video = container.querySelector('video[data-video-url]');
        var button = container.querySelector('[data-play-button]');
        var message = container.querySelector('[data-watch-message]');
        var source = video ? video.getAttribute('data-video-url') : '';
        var hls = null;
        var prepared = false;

        if (!video || !source) {
            return;
        }

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add('is-visible');
        }

        function hideMessage() {
            if (message) {
                message.classList.remove('is-visible');
            }
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            hideMessage();

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        showMessage('网络连接异常，正在重新加载');
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        showMessage('视频解码异常，正在恢复播放');
                        hls.recoverMediaError();
                    } else {
                        showMessage('播放遇到问题，请刷新后重试');
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                showMessage('此浏览器暂不支持在线播放');
            }
        }

        function startPlayback() {
            prepare();
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    showMessage('请再次点击播放');
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });

        video.addEventListener('play', function () {
            if (button) {
                button.classList.add('is-hidden');
            }
            hideMessage();
        });

        video.addEventListener('pause', function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(function () {
        document.querySelectorAll('[data-player]').forEach(attachPlayer);
    });
})();
