/* ════════════════════════════════════════
   nav.js — scroll-based nav highlight
   (home.html only — the leftnav links here
   point at this page's own sections via
   data-section, separate from their href
   which still navigates to the real page)
════════════════════════════════════════ */

const navLinks = document.querySelectorAll('.nav-section-title[data-section]');

const sections = Array.from(navLinks)
  .map(a => document.getElementById(a.dataset.section))
  .filter(Boolean);

window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 80) cur = s.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.dataset.section === cur);
  });
}, { passive: true });
