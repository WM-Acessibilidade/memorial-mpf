
(function(){
  function initPage(){
    const audio = document.getElementById('player');
    const rateLabel = document.querySelector('.rate');
    if (!audio) return;

    function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
    function updateRate(){
      if (rateLabel) rateLabel.textContent = 'Velocidade: ' + audio.playbackRate.toFixed(2) + '×';
    }

    document.addEventListener('click', function(e){
      const btn = e.target.closest('button[data-action]');
      if (!btn || !audio) return;

      const action = btn.getAttribute('data-action');
      if (action === 'rewind') {
        audio.currentTime = Math.max(0, (audio.currentTime || 0) - 10);
      } else if (action === 'forward') {
        const next = (audio.currentTime || 0) + 10;
        const dur = isFinite(audio.duration) ? audio.duration : next;
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
    }, false);

    audio.addEventListener('loadedmetadata', updateRate);
    audio.addEventListener('ratechange', updateRate);
    updateRate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }
})();
