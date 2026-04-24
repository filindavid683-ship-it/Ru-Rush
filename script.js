const revealItems = document.querySelectorAll(".reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const spotlightCards = document.querySelectorAll(".spotlight");

if (reduceMotion) {
  revealItems.forEach((item) => item.classList.add("active"));
} else {
  const revealOnView = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealOnView.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  revealItems.forEach((item) => revealOnView.observe(item));
}

const tiltCards = document.querySelectorAll(".tilt");

tiltCards.forEach((card) => {
  if (reduceMotion) return;

  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = (0.5 - (y / rect.height)) * 12;

    card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg)";
  });
});

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const magnetButtons = document.querySelectorAll(".magnet");

magnetButtons.forEach((button) => {
  if (reduceMotion) return;

  button.addEventListener("mousemove", (event) => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "translate(0, 0)";
  });
});

const hero = document.querySelector(".hero");
if (hero) {
  hero.style.transform = "none";
}

spotlightCards.forEach((card) => {
  if (reduceMotion) return;

  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty("--spotlight-x", `${x}px`);
    card.style.setProperty("--spotlight-y", `${y}px`);
  });
});

const carousel = document.querySelector(".results-carousel");

if (carousel) {
  const track = carousel.querySelector(".results-track");
  const slides = Array.from(track?.children || []);
  const prevBtn = carousel.querySelector(".carousel-btn--prev");
  const nextBtn = carousel.querySelector(".carousel-btn--next");
  const dots = carousel.querySelector(".carousel-dots");
  const autoplayDelay = Number(carousel.dataset.autoplayDelay || 3200);
  const slidesPerView = () => (window.innerWidth <= 900 ? 1 : 3);
  const pages = () => Math.max(1, Math.ceil(slides.length / slidesPerView()));

  let currentPage = 0;
  let autoplayTimer;
  let startX = 0;
  let isDragging = false;

  const rebuildDots = () => {
    if (!dots) return;
    dots.innerHTML = "";
    for (let i = 0; i < pages(); i += 1) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = i === currentPage ? "active" : "";
      dot.addEventListener("click", () => {
        currentPage = i;
        updateCarousel();
      });
      dots.appendChild(dot);
    }
  };

  const updateCarousel = () => {
    const view = slidesPerView();
    const gap = 16;
    const cardWidth = track.clientWidth / view - ((view - 1) * gap) / view;
    const pageWidth = cardWidth * view + gap * (view - 1);
    track.style.transform = `translateX(-${currentPage * pageWidth}px)`;
    dots?.querySelectorAll("button").forEach((dot, index) => {
      dot.classList.toggle("active", index === currentPage);
    });
  };

  const next = () => {
    currentPage = (currentPage + 1) % pages();
    updateCarousel();
  };

  const prev = () => {
    currentPage = (currentPage - 1 + pages()) % pages();
    updateCarousel();
  };

  const clearAutoplay = () => {
    if (autoplayTimer) clearInterval(autoplayTimer);
  };

  const startAutoplay = () => {
    if (reduceMotion) return;
    clearAutoplay();
    autoplayTimer = setInterval(next, autoplayDelay);
  };

  prevBtn?.addEventListener("click", prev);
  nextBtn?.addEventListener("click", next);

  carousel.addEventListener("mouseenter", clearAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);

  track.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
  });

  track.addEventListener("pointerup", (event) => {
    if (!isDragging) return;
    const delta = event.clientX - startX;
    if (delta < -45) next();
    if (delta > 45) prev();
    isDragging = false;
  });

  track.addEventListener("pointerleave", () => {
    isDragging = false;
  });

  window.addEventListener("resize", () => {
    currentPage = Math.min(currentPage, pages() - 1);
    rebuildDots();
    updateCarousel();
  });

  rebuildDots();
  updateCarousel();
  startAutoplay();
}

const lightbox = document.querySelector("#lightbox");
const lightboxImage = lightbox?.querySelector(".lightbox-image");
const lightboxClose = lightbox?.querySelector(".lightbox-close");
const viewButtons = document.querySelectorAll(".result-view-btn");

const closeLightbox = () => {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxImage.alt = "";
};

if (lightbox && lightboxImage) {
  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const card = button.closest(".result-card");
      const image = card?.querySelector("img");
      if (!image) return;
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt || "Фото работы";
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });
}

const callbackForm = document.querySelector("#callback-form");

if (callbackForm) {
  callbackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = callbackForm.querySelector("input[name='name']")?.value?.trim() || "";
    const phone = callbackForm.querySelector("input[name='phone']")?.value?.trim() || "";
    if (!name || !phone) return;
    callbackForm.reset();
    alert("Спасибо! Заявка отправлена, мы скоро свяжемся с вами.");
  });
}
