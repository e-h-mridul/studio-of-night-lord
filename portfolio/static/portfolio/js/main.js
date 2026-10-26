/* Studio of Night Lord — navigation, rails, and accessible motion */

(() => {
  const button = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-nav");

  if (button && menu) {
    const closeMenu = () => {
      menu.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
    };

    button.addEventListener("click", () => {
      const open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }
})();

/* Horizontal project and certification rails. */
document.querySelectorAll("[data-content-rail]").forEach((rail) => {
  const railName = rail.dataset.contentRail;
  const controls = document.querySelector(`[data-rail-controls="${railName}"]`);
  const previousButton = controls?.querySelector("[data-rail-prev]");
  const nextButton = controls?.querySelector("[data-rail-next]");
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const cards = Array.from(
    rail.querySelectorAll(":scope > .project-card, :scope > .cert-item"),
  );

  function updateRailControls() {
    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const hasOverflow = maxScroll > 4;

    if (controls) controls.hidden = !hasOverflow;

    if (previousButton) {
      previousButton.disabled = !hasOverflow || rail.scrollLeft <= 3;
    }

    if (nextButton) {
      nextButton.disabled = !hasOverflow || rail.scrollLeft >= maxScroll - 3;
    }
  }

  function scrollOneCard(direction) {
    const firstCard = cards[0];
    const gap = parseFloat(getComputedStyle(rail).gap) || 20;
    const distance = firstCard
      ? firstCard.getBoundingClientRect().width + gap
      : rail.clientWidth * 0.8;

    rail.scrollBy({
      left: direction * distance,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  previousButton?.addEventListener("click", () => scrollOneCard(-1));
  nextButton?.addEventListener("click", () => scrollOneCard(1));

  rail.addEventListener("scroll", updateRailControls, {
    passive: true,
  });

  rail.addEventListener("keydown", (event) => {
    if (event.target !== rail) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollOneCard(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollOneCard(1);
    }
  });

  /* Shift + mouse wheel supports horizontal movement. */
  rail.addEventListener(
    "wheel",
    (event) => {
      if (!event.shiftKey || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }

      event.preventDefault();
      rail.scrollBy({
        left: event.deltaY,
        behavior: "auto",
      });
    },
    { passive: false },
  );

  rail.querySelectorAll("img").forEach((image) => {
    image.addEventListener("load", updateRailControls);
    image.addEventListener("error", updateRailControls);
  });

  /* Animate cards as they enter and leave the horizontal rail. */
  if (!reducedMotion && "IntersectionObserver" in window && cards.length) {
    document.documentElement.classList.add("js-rail-motion-enabled");

    const railObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target;

          if (entry.isIntersecting) {
            card.classList.remove("is-rail-exiting");
            card.classList.add("is-rail-visible");
          } else if (card.dataset.railSeen === "true") {
            card.classList.remove("is-rail-visible");
            card.classList.add("is-rail-exiting");
          }

          if (entry.isIntersecting) {
            card.dataset.railSeen = "true";
          }
        });
      },
      {
        root: rail,
        threshold: 0.18,
        rootMargin: "0px -4% 0px -4%",
      },
    );

    cards.forEach((card) => railObserver.observe(card));
  }

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(updateRailControls);
    resizeObserver.observe(rail);

    cards.forEach((card) => resizeObserver.observe(card));
  } else {
    window.addEventListener("resize", updateRailControls);
  }

  requestAnimationFrame(updateRailControls);
  window.addEventListener("load", updateRailControls, {
    once: true,
  });
});

/* Portrait carousel: crossfade between images while preserving keyboard/touch controls. */
document.querySelectorAll("[data-portrait-carousel]").forEach((carousel) => {
  const stage = carousel.querySelector("[data-portrait-stage]");
  const image = carousel.querySelector("[data-portrait-image]");
  const counter = carousel.querySelector("[data-portrait-counter]");
  const previousButton = carousel.querySelector("[data-portrait-prev]");
  const nextButton = carousel.querySelector("[data-portrait-next]");
  const preview = carousel.querySelector("[data-portrait-preview]");
  const previewImage = carousel.querySelector("[data-portrait-preview-image]");
  const closeButtons = carousel.querySelectorAll("[data-portrait-close]");
  const closeButton = carousel.querySelector(".portrait-preview-close");

  if (
    !stage ||
    !image ||
    !counter ||
    !previousButton ||
    !nextButton ||
    !preview ||
    !previewImage ||
    !closeButton
  ) {
    return;
  }

  const photos = [
    { src: carousel.dataset.primarySrc, alt: carousel.dataset.primaryAlt },
    { src: carousel.dataset.secondarySrc, alt: carousel.dataset.secondaryAlt },
  ].filter((photo) => photo.src);

  if (!photos.length) return;

  // Preload the alternate portrait so the crossfade feels responsive.
  photos.forEach((photo) => {
    const preload = new Image();
    preload.src = photo.src;
  });

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let currentIndex = 0;
  let requestedIndex = 0;
  let transitionTimer = null;
  let transitionToken = 0;
  let previousFocus = null;
  let startX = 0;
  let startY = 0;
  let suppressClick = false;

  function renderPhoto() {
    const photo = photos[currentIndex];
    image.src = photo.src;
    image.alt = photo.alt || "Portfolio portrait";
    previewImage.src = photo.src;
    previewImage.alt = photo.alt || "Portfolio portrait";
    counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    previousButton.disabled = photos.length < 2;
    nextButton.disabled = photos.length < 2;
  }

  function changePhoto(direction) {
    if (photos.length < 2) return;

    requestedIndex =
      (requestedIndex + direction + photos.length) % photos.length;
    if (transitionTimer !== null) window.clearTimeout(transitionTimer);

    if (reducedMotion) {
      currentIndex = requestedIndex;
      renderPhoto();
      return;
    }

    const token = ++transitionToken;
    image.classList.add("is-changing");
    transitionTimer = window.setTimeout(() => {
      if (token !== transitionToken) return;
      currentIndex = requestedIndex;
      renderPhoto();
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() =>
          image.classList.remove("is-changing"),
        );
      });
    }, 180);
  }

  function openPreview() {
    if (!preview.hidden) return;
    previousFocus = document.activeElement;
    preview.hidden = false;
    preview.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    closeButton.focus();
  }

  function closePreview() {
    if (preview.hidden) return;
    preview.hidden = true;
    preview.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (previousFocus && typeof previousFocus.focus === "function") {
      previousFocus.focus();
    } else {
      stage.focus();
    }
  }

  previousButton.addEventListener("click", () => changePhoto(-1));
  nextButton.addEventListener("click", () => changePhoto(1));

  stage.addEventListener("click", () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    openPreview();
  });

  stage.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      changePhoto(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      changePhoto(1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPreview();
    }
  });

  closeButtons.forEach((button) =>
    button.addEventListener("click", closePreview),
  );

  preview.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closePreview();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      changePhoto(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      changePhoto(1);
    } else if (event.key === "Tab") {
      event.preventDefault();
      closeButton.focus();
    }
  });

  stage.addEventListener(
    "touchstart",
    (event) => {
      if (event.changedTouches.length !== 1) return;
      startX = event.changedTouches[0].clientX;
      startY = event.changedTouches[0].clientY;
    },
    { passive: true },
  );

  stage.addEventListener(
    "touchend",
    (event) => {
      if (event.changedTouches.length !== 1) return;
      const endX = event.changedTouches[0].clientX;
      const endY = event.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      if (
        photos.length > 1 &&
        Math.abs(deltaX) > 45 &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        changePhoto(deltaX < 0 ? 1 : -1);
        suppressClick = true;
        window.setTimeout(() => {
          suppressClick = false;
        }, 500);
      }
    },
    { passive: true },
  );

  renderPhoto();
});

/* Repeatable scroll reveals for page sections and cards */
(() => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reducedMotion || !("IntersectionObserver" in window)) {
    return;
  }

  const sectionTargets = Array.from(
    document.querySelectorAll("main > .section:not(.hero) > .container"),
  );

  //Animations for the cards within the sections have been disabled for now, as they were causing performance issues on some devices. If you want to re-enable them, uncomment the following lines and add the appropriate classes to your HTML elements.
  // const cardTargets = Array.from(
  //   document.querySelectorAll(
  //     ".section-head, .skill-pill, .project-card, " +
  //       ".journey-panel, .cert-item, .contact-grid > div, .resume-card",
  //   ),
  // );

  const cardTargets = Array.from(
    document.querySelectorAll(
      ".section-head, .skill-pill, " +
        ".journey-panel, .contact-grid > div, .resume-card",
    ),
  );

  const targets = Array.from(new Set([...sectionTargets, ...cardTargets]));

  if (!targets.length) return;

  targets.forEach((target, index) => {
    target.classList.add("reveal-on-scroll");
    target.style.setProperty("--reveal-delay", `${(index % 4) * 65}ms`);
  });

  //Animation for the page sections and their cards as they enter the viewport
  // const pageObserver = new IntersectionObserver(
  //   (entries) => {
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //         entry.target.classList.add("is-visible");
  //       } else {
  //         entry.target.classList.remove("is-visible");
  //       }
  //     });
  //   },
  //   {
  //     threshold: 0.08,
  //     rootMargin: "0px 0px -35px 0px",
  //   },
  // );

  const pageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -35px 0px",
    },
  );

  document.documentElement.classList.add("js-reveal-enabled");

  targets.forEach((target) => pageObserver.observe(target));
})();
