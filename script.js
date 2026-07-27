const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.getElementById('nav-menu');

// Les pages légales n'ont pas de menu : on ne branche ce bloc que s'il existe
if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  // Ferme le menu automatiquement une fois qu'on a choisi une section
  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });
}

// Barre de progression de lecture en haut de page
const scrollProgress = document.getElementById('scroll-progress');

if (scrollProgress) {
  window.addEventListener('scroll', () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    scrollProgress.style.width = `${percent}%`;
  });
}

// Fait apparaître chaque section en douceur quand elle entre dans l'écran
const sections = document.querySelectorAll('main section');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

sections.forEach((section) => observer.observe(section));

// Carrousel du hero : change de slide automatiquement, ou au clic sur un point
const heroCarousel = document.getElementById('hero-carousel');

if (heroCarousel) {
  const slides = heroCarousel.querySelectorAll('.hero-slide');
  const dots = heroCarousel.querySelectorAll('.hero-dot');
  let current = 0;

  function goToSlide(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    dots[current].removeAttribute('aria-current');
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-current', 'true');
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goToSlide(index));
  });

  // Respecte la préférence "réduire les animations" : pas de défilement automatique
  // (la navigation manuelle par les points reste disponible)
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    setInterval(() => {
      goToSlide((current + 1) % slides.length);
    }, 4000);
  }
}

// Cache la barre CTA fixe une fois arrivé sur la section Contact (redondante à cet endroit)
const stickyCta = document.getElementById('sticky-cta');
const contactSection = document.getElementById('contact');

if (stickyCta && contactSection) {
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      stickyCta.classList.toggle('hidden', entry.isIntersecting);
    });
  }, { threshold: 0.3 });

  ctaObserver.observe(contactSection);
}
