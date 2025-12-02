// main.js – lightweight behavior for Baby Gunner's Hundred Acre Celebration

document.addEventListener('DOMContentLoaded', () => {
  /* ========= SMOOTH SCROLL FOR NAV ========= */
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      e.preventDefault();
      targetEl.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });

  /* ========= RSVP UX (STATIC-FRIENDLY) ========= */
  const form = document.getElementById('rsvpForm');
  const note = document.getElementById('rsvpNote');

  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Eventually you can send this data somewhere; for now it's just feedback.
      note.textContent =
        "Thank you! Your RSVP has been noted. " +
        "If this site is hosted as a static page, please also text or email the hosts so nothing gets lost in the Wood.";

      note.style.fontWeight = '600';
    });
  }
});
