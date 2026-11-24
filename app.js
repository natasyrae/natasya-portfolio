(() => {
  'use strict';
  const cityIds = ['chongqing', 'shanghai', 'harbin'];
  const storageKey = 'natasya.china-quest.v1.visited';
  let visited = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(saved)) visited = new Set(saved.filter(id => cityIds.includes(id)));
  } catch { /* Progress still works for this session. */ }

  function renderProgress() {
    const count = visited.size;
    const track = document.getElementById('progressTrack');
    track.setAttribute('aria-valuenow', count);
    document.getElementById('progressText').textContent = count + '/3 cities';
    [...track.children].forEach((bar, i) => bar.classList.toggle('done', i < count));
    track.setAttribute('aria-valuetext', count + ' of 3 cities visited');
    document.querySelectorAll('.map-pin[data-map-city]').forEach(marker => {
      const reached = visited.has(marker.dataset.mapCity);
      marker.classList.toggle('map-visited', reached);
      if (reached) marker.setAttribute('aria-description', 'Previously visited');
    });
  }
  window.markCityVisited = id => {
    if (!cityIds.includes(id) || visited.has(id)) return;
    visited.add(id);
    renderProgress();
    try { localStorage.setItem(storageKey, JSON.stringify([...visited])); } catch { /* Session only. */ }
  };
  renderProgress();
  document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(renderProgress), { once: true });

  const nav = document.getElementById('mainNav');
  const menu = document.getElementById('menu');
  function toggleMenu(open) {
    nav.classList.toggle('expanded', open);
    menu.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  menu.addEventListener('click', () => toggleMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('pointerdown', event => {
    if (!event.target.closest('.site-head')) toggleMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      toggleMenu(false);
      menu.focus();
    }
  });
  nav.addEventListener('click', () => toggleMenu(false));

  const guide = document.getElementById('guideDialog');
  document.getElementById('guide').addEventListener('click', () => guide.showModal());
  guide.querySelector('.dialog-close').addEventListener('click', () => guide.close());
  guide.addEventListener('click', event => {
    if (event.target === guide) {
      const box = guide.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) guide.close();
    }
  });
  document.querySelectorAll('[data-panel]').forEach(button => {
    button.addEventListener('click', () => window.openPortfolioPanel(button.dataset.panel));
  });
  document.getElementById('guidePlay').addEventListener('click', () => {
    guide.close();
    window.ChinaGame.start();
  });

  const sound = document.getElementById('sound');
  let audio;
  let soundOn = false;
  function chime(notes) {
    if (!soundOn || !audio || audio.state !== 'running') return;
    notes.forEach((frequency, i) => {
      const start = audio.currentTime + i * .08;
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'triangle';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(.001, start);
      gain.gain.exponentialRampToValueAtTime(.09, start + .009);
      gain.gain.exponentialRampToValueAtTime(.001, start + .2);
      osc.connect(gain).connect(audio.destination);
      osc.start(start);
      osc.stop(start + .21);
    });
  }
  sound.addEventListener('click', async () => {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) { sound.disabled = true; sound.title = 'Sound is unavailable in this browser'; return; }
    if (!audio) audio = new Audio();
    if (!soundOn) {
      try { await audio.resume(); } catch { return; }
    }
    soundOn = !soundOn;
    sound.setAttribute('aria-pressed', soundOn);
    sound.setAttribute('aria-label', soundOn ? 'Turn sound off' : 'Turn sound on');
    sound.querySelector('b').textContent = soundOn ? 'ON' : 'OFF';
    sound.querySelector('use').setAttribute('href', soundOn ? '#i-volume' : '#i-mute');
    chime([392, 523.25, 659.25]);
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('button, a, summary');
    if (button && button !== sound) chime(button.matches('.map-pin, .map-action') ? [392, 493.88, 587.33] : [493.88]);
  });
})();
