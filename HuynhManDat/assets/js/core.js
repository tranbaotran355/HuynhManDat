(function () {
  "use strict";

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const progressBar = document.querySelector(".reading-progress span");
  const backToTop = document.querySelector("[data-back-to-top]");
  const parallaxItems = document.querySelectorAll("[data-parallax]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ticking = false;

  function closeMenu() {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("is-locked");
  }

  function toggleMenu() {
    if (!menuToggle || !nav) return;
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
    document.body.classList.toggle("is-locked", !open);
  }

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleMenu);
  }

  if (nav) {
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 900) closeMenu();
  });

  function updateScrollState() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(y / max, 1) : 0;

    if (header) header.classList.toggle("is-scrolled", y > 40);
    if (backToTop) backToTop.classList.toggle("is-visible", y > 760);
    if (progressBar) progressBar.style.transform = "scaleX(" + progress + ")";

    if (!reducedMotion.matches) {
      parallaxItems.forEach(function (item) {
        const rect = item.getBoundingClientRect();
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        item.style.transform = "translate3d(0," + (offset * -16).toFixed(2) + "px,0)";
      });
    }

    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollState);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  updateScrollState();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reducedMotion.matches ? "auto" : "smooth" });
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  const sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".site-nav a"));

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      const isActive = link.getAttribute("href") === "#" + id;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        const visible = entries
          .filter(function (entry) { return entry.isIntersecting; })
          .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });

        if (visible.length) setActiveLink(visible[0].target.id);
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0, 0.15, 0.4] }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  const hero = document.querySelector(".hero");
  if (hero && "IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActiveLink("trang-chu");
        });
      },
      { threshold: 0.35 }
    );
    heroObserver.observe(hero);
  }

})();
