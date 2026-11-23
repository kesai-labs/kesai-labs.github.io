(() => {
  const speed = document.getElementById('drive-speed');
  const swerve = document.getElementById('drive-swerve');
  if (!speed || !swerve) return;
  const times = Array.from({ length: 8 }, (_, i) => (i + 1) / 2);
  const lateral = (a, t) => a * Math.sin(Math.PI * t / 4) ** 2;
  const point = (x, y) => [160 + x * 24, 346 - y * 2.1];
  const path = points => points.map((p, i) => `${i ? 'L' : 'M'}${p.join(',')}`).join(' ');

  function draw(id, v, a, color) {
    const svg = document.getElementById(id);
    const points = Array.from({ length: 81 }, (_, i) => {
      const t = i / 20;
      return point(lateral(a, t), v / 3.6 * t);
    });
    svg.innerHTML = `<rect x="34" y="20" width="252" height="344" rx="8" fill="#233027"/>
      <rect x="34" y="20" width="168" height="344" fill="#202326"/>
      <rect x="34" y="20" width="84" height="344" fill="${a < -1.75 ? '#642e35' : '#292d33'}"/>
      ${a > 1.75 ? '<rect x="202" y="20" width="84" height="344" fill="#642e35"/>' : ''}
      <path d="M34 20V364 M202 20V364" stroke="#ddd" stroke-width="2"/>
      <path d="M118 20V364" stroke="#ddd" stroke-width="2" stroke-dasharray="12 12"/>
      <path d="M76 55V85 M66 75L76 85L86 75 M180 85V55 M170 65L180 55L190 65" fill="none" stroke="#aaa" stroke-width="3"/>
      <path d="${path([point(0, 0), point(0, 100 / 3.6 * 4)])}" fill="none" stroke="#eee" stroke-width="2" stroke-dasharray="5 5"/>
      <path d="${path(points)}" fill="none" stroke="${color}" stroke-width="3"/>
      ${times.map(t => {
        const r = point(0, 100 / 3.6 * t);
        const p = point(lateral(a, t), v / 3.6 * t);
        return `<path d="M${r}L${p}" stroke="${color}" stroke-opacity=".5"/><circle cx="${r[0]}" cy="${r[1]}" r="3" fill="#eee"/><circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${color}"/>`;
      }).join('')}
      <rect x="152" y="336" width="16" height="26" rx="4" fill="${color}" stroke="#111"/>
      <rect x="155" y="340" width="10" height="6" rx="1" fill="#202326"/>
      `;
  }

  function highlight(metric, left, right, lowerIsBetter) {
    const tied = Math.abs(left - right) < 1e-9;
    const leftBetter = lowerIsBetter ? left < right : left > right;
    for (const [name, better] of [['speed', leftBetter], ['swerve', !leftBetter]]) {
      document.getElementById(`${name}-${metric}-card`).classList.toggle('is-better', !tied && better);
      document.getElementById(`${name}-${metric}-status`).textContent = tied ? 'Tied' : better ? '✓ Better' : '';
    }
  }

  function update() {
    const v = Number(speed.value), a = Number(swerve.value);
    const speedError = times.reduce((sum, t) => sum + Math.abs(v - 100) / 3.6 * t, 0) / times.length;
    const swerveError = times.reduce((sum, t) => sum + Math.abs(lateral(a, t)), 0) / times.length;
    document.getElementById('speed-value').textContent = `${v} km/h`;
    const offset = a === 0 ? '0.0 m (straight)' : `${Math.abs(a).toFixed(1)} m ${a < 0 ? 'left' : 'right'}`;
    document.getElementById('swerve-value').textContent = offset;
    speed.setAttribute('aria-valuetext', `${v} kilometers per hour`);
    swerve.setAttribute('aria-valuetext', offset);
    for (const [name, error] of [['speed', speedError], ['swerve', swerveError]]) {
      document.getElementById(`${name}-error`).textContent = `${error.toFixed(2)} m`;
      document.getElementById(`${name}-bar`).style.width = `${error / 20 * 100}%`;
    }
    // Toy adaptation: progress relative to the recording, gated by both checks.
    const speedPdm = Math.min(1, v / 100);
    const swervePdm = Math.abs(a) <= 1.75 ? 1 : 0;
    for (const [name, score] of [['speed', speedPdm], ['swerve', swervePdm]]) {
      document.getElementById(`${name}-pdm`).textContent = score.toFixed(2);
      document.getElementById(`${name}-pdm-bar`).style.width = `${score * 100}%`;
    }
    highlight('error', speedError, swerveError, true);
    highlight('pdm', speedPdm, swervePdm, false);
    const compliance = a > 1.75
      ? '✕ Drivable area compliance'
      : a < -1.75
      ? '✕ Driving direction compliance'
      : '✓ Compliant';
    const status = document.getElementById('swerve-compliance');
    status.textContent = compliance;
    status.classList.toggle('is-failure', Math.abs(a) > 1.75);
    draw('speed-road', v, 0, '#ffbe27');
    draw('swerve-road', 100, a, '#74bbff');
  }
  speed.addEventListener('input', update);
  swerve.addEventListener('input', update);
  update();
})();

// Large centered play button for each video. The native <video controls>
// player only exposes a tiny play control in the bottom-left corner, so we
// overlay an amber button that triggers playback and steps out of the way
// once the video is running (the native controls still work underneath).
document.querySelectorAll(".lead-video-embed video").forEach(function (video) {
  const embed = video.parentElement;
  if (!embed) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "lead-video-play";
  btn.setAttribute("aria-label", "Play video");
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  embed.appendChild(btn);

  btn.addEventListener("click", function () {
    video.play();
  });
  video.addEventListener("play", function () {
    embed.classList.add("is-playing");
  });
  video.addEventListener("pause", function () {
    embed.classList.remove("is-playing");
  });
  video.addEventListener("ended", function () {
    embed.classList.remove("is-playing");
  });
});

// Play when as much of the video as fits in the viewport is visible.
// A fixed intersection ratio can be unreachable for these portrait videos.
(() => {
  const videos = document.querySelectorAll('.lead-video-embed video');
  if (!videos.length) return;
  const visibility = new WeakMap();
  let scheduled = false;

  function updatePlayback() {
    scheduled = false;
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = document.documentElement.clientHeight;
    videos.forEach(video => {
      const rect = video.getBoundingClientRect();
      const visibleWidth = Math.max(0, Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0));
      const visibleHeight = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
      const availableArea = Math.min(rect.width, viewportWidth) * Math.min(rect.height, viewportHeight);
      const fullyVisible = availableArea > 0 && visibleWidth * visibleHeight >= availableArea * 0.99;

      // Only act on visibility changes so native pause/play controls still work.
      if (visibility.get(video) === fullyVisible) return;
      visibility.set(video, fullyVisible);
      if (fullyVisible) {
        const playback = video.play();
        if (playback && typeof playback.catch === 'function') playback.catch(error => {
          // Scrolling away can cancel a pending play request normally.
          if (error.name !== 'AbortError') {
            console.warn('Figure 2 autoplay failed:', video.currentSrc, error);
          }
        });
      } else if (!video.paused) {
        video.pause();
      }
    });
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updatePlayback);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleUpdate);
    observer.observe(document.body);
    videos.forEach(video => observer.observe(video));
  }
  scheduleUpdate();
})();
