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
