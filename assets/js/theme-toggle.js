// Theme Toggle - Light/Dark Mode
(function() {
  'use strict';

  const html = document.documentElement;
  const body = document.body;
const toggle = document.querySelector('#themeToggle');
  const sunIcon = toggle?.querySelector('.ri-sun-fill');
  const moonIcon = toggle?.querySelector('.ri-contrast-2-line');
  if (!sunIcon || !moonIcon) {
    console.error('Toggle icons not found');
    return;
  }

  if (!toggle) return;

  // Load saved theme or detect system preference
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
  }

  // Set theme
  function setTheme(theme) {
    html.setAttribute('data-bs-theme', theme);
    body.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
      toggle.title = 'Switch to Light Mode';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
      toggle.title = 'Switch to Dark Mode';
    }
  }

  // Toggle theme
  toggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-bs-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });

  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Init
  initTheme();
})();

