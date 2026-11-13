(function () {
  "use strict";

  const timeline = document.querySelector("[data-timeline]");
  if (!timeline) return;

  const progress = timeline.querySelector("[data-timeline-progress]");
  const items = Array.prototype.slice.call(timeline.querySelectorAll(".timeline-item"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;

  function updateTimeline() {
    const rect = timeline.getBoundingClientRect();
    const viewportLine = window.innerHeight * 0.55;
    const total = rect.height;
    const raw = (viewportLine - rect.top) / total;
    const ratio = Math.max(0, Math.min(1, raw));

    if (progress) {
      progress.style.transform = "scaleY(" + ratio.toFixed(4) + ")";
      if (reducedMotion.matches) progress.style.transition = "none";
    }

    let currentIndex = -1;
    items.forEach(function (item, index) {
      const itemRect = item.getBoundingClientRect();
      if (itemRect.top < viewportLine) currentIndex = index;
    });

    items.forEach(function (item, index) {
      item.classList.toggle("is-current", index === currentIndex);
    });

    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateTimeline);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  updateTimeline();
})();
