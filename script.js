// Core page interactions for the Hundred Acre Wood experience.
// Game visuals and demos have been moved to games.js to keep concerns separated.

document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  const storybookCover = document.getElementById('storybookCover');
  const openBookBtn = document.getElementById('openBookBtn');
  const mainContent = document.getElementById('mainContent');
  const readingProgress = document.getElementById('readingProgress');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = Array.from(document.querySelectorAll('.nav-item'));
  const scrollTopFab = document.getElementById('scrollTopFab');
  const scrollRsvpFab = document.getElementById('scrollRsvpFab');
  const persistentRsvpBtn = document.getElementById('persistentRsvpBtn');
  const musicToggle = document.getElementById('musicToggle');
  const motionToggle = document.getElementById('motionToggle');
  const bgMusic = document.getElementById('bgMusic');

  // Fade out loading screen after a brief delay.
  window.setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }, 600);

  // Reveal the storybook content.
  function openBook() {
    storybookCover?.classList.add('hidden');
    mainContent?.classList.remove('hidden');
    mainContent?.focus({ preventScroll: true });
  }

  openBookBtn?.addEventListener('click', openBook);

  // Navigation toggle for small screens.
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu?.setAttribute('aria-hidden', String(expanded));
  });

  // Smooth scrolling for nav links and FABs.
  function scrollToTarget(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const section = link.getAttribute('data-section');
      if (section) {
        scrollToTarget(section);
      }
      navMenu?.setAttribute('aria-hidden', 'true');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  scrollTopFab?.addEventListener('click', () => scrollToTarget('mainContent'));
  scrollRsvpFab?.addEventListener('click', () => scrollToTarget('section6'));
  persistentRsvpBtn?.addEventListener('click', () => scrollToTarget('section6'));

  // Reading progress indicator.
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    if (readingProgress) {
      readingProgress.style.width = `${progress}%`;
      readingProgress.setAttribute('aria-valuenow', progress.toFixed(0));
    }

    // Toggle persistent RSVP visibility.
    if (persistentRsvpBtn) {
      persistentRsvpBtn.classList.toggle('hidden', scrollTop < 400);
    }
  }

  window.addEventListener('scroll', updateProgress);
  updateProgress();

  // Music controls.
  musicToggle?.addEventListener('click', () => {
    if (!bgMusic) return;

    if (bgMusic.paused) {
      bgMusic.play().catch(() => {});
      musicToggle.setAttribute('aria-pressed', 'true');
    } else {
      bgMusic.pause();
      musicToggle.setAttribute('aria-pressed', 'false');
    }
  });

  // Reduced motion toggle.
  motionToggle?.addEventListener('click', () => {
    const prefersReducedMotion = document.body.classList.toggle('reduce-motion');
    motionToggle.setAttribute('aria-pressed', String(prefersReducedMotion));
  });
});
