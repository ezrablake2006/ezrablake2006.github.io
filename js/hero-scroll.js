(function () {
  const hero = document.querySelector(".hero");

  if (!hero) return;

  let ticking = false;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function updateHeroScroll() {
    const rect = hero.getBoundingClientRect();
    const heroHeight = hero.offsetHeight || window.innerHeight;

    const progress = clamp(-rect.top / (heroHeight * 0.72), 0, 1);

    const bgOpacity = 1 - progress * 0.72;
    const bgBlur = progress * 28;
    const textOpacity = 1 - progress * 1.15;
    const textY = -24 * progress;

    const contentProgress = clamp((progress - 0.22) / 0.62, 0, 1);
    const contentY = 36 * (1 - contentProgress);

    hero.style.setProperty("--hero-bg-opacity", bgOpacity.toFixed(3));
    hero.style.setProperty("--hero-bg-blur", bgBlur.toFixed(1) + "px");
    hero.style.setProperty("--hero-text-opacity", clamp(textOpacity, 0, 1).toFixed(3));
    hero.style.setProperty("--hero-text-y", textY.toFixed(1) + "px");

    document.documentElement.style.setProperty("--home-content-opacity", contentProgress.toFixed(3));
    document.documentElement.style.setProperty("--home-content-y", contentY.toFixed(1) + "px");

    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updateHeroScroll);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  updateHeroScroll();
})();