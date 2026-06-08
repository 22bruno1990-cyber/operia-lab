const anchorLinks = document.querySelectorAll('a[href^="#"]');

function scrollToSection(targetId) {
  const target = document.querySelector(targetId);

  if (!target) {
    return;
  }

  const headerOffset = document.querySelector(".site-header")?.offsetHeight || 0;
  const targetTop = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: "auto",
  });
}

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");

    if (!targetId || targetId === "#") {
      return;
    }

    event.preventDefault();
    history.pushState(null, "", targetId);
    scrollToSection(targetId);
  });
});

window.addEventListener("load", () => {
  if (window.location.hash) {
    requestAnimationFrame(() => scrollToSection(window.location.hash));
    [160, 520, 980].forEach((delay) => {
      window.setTimeout(() => scrollToSection(window.location.hash), delay);
    });
  }
});
