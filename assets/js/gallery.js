(function () {
  "use strict";

  const gallery = document.querySelector("[data-gallery]");
  const lightbox = document.querySelector("[data-lightbox]");
  if (!gallery || !lightbox) return;

  const items = Array.prototype.slice.call(gallery.querySelectorAll(".gallery-item"));
  const image = lightbox.querySelector("[data-lightbox-image]");
  const caption = lightbox.querySelector("[data-lightbox-caption]");
  const credit = lightbox.querySelector("[data-lightbox-credit]");
  const closeButton = lightbox.querySelector("[data-lightbox-close]");
  const prevButton = lightbox.querySelector("[data-lightbox-prev]");
  const nextButton = lightbox.querySelector("[data-lightbox-next]");
  let current = 0;
  let lastFocused = null;
  let touchStartX = 0;

  if (!items.length || !image) return;

  function render(index) {
    const item = items[index];
    const source = item.getAttribute("data-full");
    const thumb = item.querySelector("img");
    image.src = source || (thumb ? thumb.src : "");
    image.alt = thumb ? thumb.alt : "";
    if (caption) caption.textContent = item.getAttribute("data-caption") || "";
    if (credit) credit.textContent = item.getAttribute("data-credit") || "";
    current = index;
  }

  function open(index) {
    lastFocused = document.activeElement;
    render(index);
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    if (closeButton) closeButton.focus();
  }

  function close() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }

  function step(direction) {
    render((current + direction + items.length) % items.length);
  }

  items.forEach(function (item, index) {
    item.addEventListener("click", function () {
      open(index);
    });
  });

  if (closeButton) closeButton.addEventListener("click", close);

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      step(-1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      step(1);
    });
  }

  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) close();
  });

  document.addEventListener("keydown", function (event) {
    if (!lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") {
      close();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }

    if (event.key !== "Tab") return;

    const focusable = Array.prototype.slice
      .call(lightbox.querySelectorAll("button"))
      .filter(function (element) { return !element.disabled; });
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  lightbox.addEventListener(
    "touchstart",
    function (event) {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  lightbox.addEventListener(
    "touchend",
    function (event) {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 50) return;
      step(delta > 0 ? -1 : 1);
    },
    { passive: true }
  );
})();
