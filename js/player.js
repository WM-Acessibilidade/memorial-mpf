(function(){
  function formatTime(t){
    if (!isFinite(t) || t < 0) return '0:00';
    var h = Math.floor(t / 3600);
    var m = Math.floor((t % 3600) / 60);
    var s = Math.floor(t % 60);
    if (h > 0) {
      return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }
    return m + ':' + String(s).padStart(2, '0');
  }

  function initPage(){
    var audio = document.getElementById('player');
    var rateLabel = document.querySelector('.rate');
    var timeLabel = document.querySelector('.tempo');
    var initialFocusButton = document.querySelector('button[data-initial-focus="true"]');
    if (!audio) return;

    function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

    function updateRate(){
      if (rateLabel) rateLabel.textContent = 'Velocidade: ' + audio.playbackRate.toFixed(2) + '×';
    }

    function updateTime(){
      if (!timeLabel) return;
      var current = isFinite(audio.currentTime) ? audio.currentTime : 0;
      var duration = isFinite(audio.duration) ? audio.duration : 0;
      timeLabel.textContent = 'Tempo: ' + formatTime(current) + ' / ' + formatTime(duration);
    }

    document.addEventListener('click', function(e){
      var btn = e.target.closest('button[data-action]');
      if (!btn || !audio) return;

      var action = btn.getAttribute('data-action');
      if (action === 'rewind') {
        audio.currentTime = Math.max(0, (audio.currentTime || 0) - 10);
      } else if (action === 'forward') {
        var next = (audio.currentTime || 0) + 10;
        var dur = isFinite(audio.duration) ? audio.duration : next;
        audio.currentTime = Math.min(dur, next);
      } else if (action === 'playpause') {
        if (audio.paused) { audio.play(); } else { audio.pause(); }
      } else if (action === 'slower') {
        audio.playbackRate = clamp((audio.playbackRate || 1) - 0.1, 0.5, 2.0);
        updateRate();
      } else if (action === 'faster') {
        audio.playbackRate = clamp((audio.playbackRate || 1) + 0.1, 0.5, 2.0);
        updateRate();
      }
      updateTime();
    }, false);

    audio.addEventListener('loadedmetadata', updateRate);
    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('durationchange', updateTime);
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('progress', updateTime);
    audio.addEventListener('canplay', updateTime);
    audio.addEventListener('play', updateTime);
    audio.addEventListener('pause', updateTime);
    audio.addEventListener('ratechange', updateRate);

    updateRate();
    updateTime();

    // Ensures metadata loading on browsers without native controls visible
    try { audio.load(); } catch (e) {}

    if (initialFocusButton) {
      window.setTimeout(function(){
        initialFocusButton.focus();
      }, 50);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }
})();
