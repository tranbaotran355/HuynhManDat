(function () {
  "use strict";

  const stage = document.querySelector("[data-book]");
  if (!stage) return;

  const pages = Array.prototype.slice.call(stage.querySelectorAll(".book-page"));
  const dots = Array.prototype.slice.call(stage.querySelectorAll("[data-book-dot]"));
  const prevButton = stage.querySelector("[data-book-prev]");
  const nextButton = stage.querySelector("[data-book-next]");
  const pagesWrap = stage.querySelector("#poem-pages");
  let current = 0;
  let locked = false;
  let touchStartX = 0;

  if (!pages.length) return;

  if (pagesWrap) pagesWrap.setAttribute("aria-live", "polite");

  pages.forEach(function (page, index) {
    page.setAttribute("aria-hidden", String(index !== current));
  });

  function updateDots() {
    dots.forEach(function (dot, index) {
      const active = index === current;
      dot.classList.toggle("is-active", active);
      if (active) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });
  }

  function goTo(index, direction) {
    if (locked) return;
    const total = pages.length;
    const next = (index + total) % total;
    if (next === current) return;

    locked = true;
    const outgoing = pages[current];
    const incoming = pages[next];

    outgoing.classList.remove("is-active");
    outgoing.classList.add("is-leaving");
    outgoing.setAttribute("aria-hidden", "true");

    incoming.classList.add("is-active");
    incoming.setAttribute("aria-hidden", "false");

    if (direction) {
      incoming.style.transformOrigin = direction === "back" ? "left center" : "right center";
    }

    current = next;
    updateDots();

    window.setTimeout(function () {
      outgoing.classList.remove("is-leaving");
      incoming.style.transformOrigin = "";
      locked = false;
    }, 320);
  }

  if (prevButton) {
    prevButton.addEventListener("click", function () {
      goTo(current - 1, "back");
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      goTo(current + 1, "forward");
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const index = Number(dot.getAttribute("data-book-dot"));
      goTo(index, index < current ? "back" : "forward");
    });
  });

  stage.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(current - 1, "back");
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(current + 1, "forward");
    }
  });

  stage.addEventListener(
    "touchstart",
    function (event) {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  stage.addEventListener(
    "touchend",
    function (event) {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 48) return;
      if (delta > 0) {
        goTo(current - 1, "back");
      } else {
        goTo(current + 1, "forward");
      }
    },
    { passive: true }
  );

  updateDots();
})();
