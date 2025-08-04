const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';

document.body.classList.add(currentTheme);

themeToggle.addEventListener('click', () => {
  const newTheme = document.body.classList.contains('light') ? 'dark' : 'light';
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(newTheme);
  localStorage.setItem('theme', newTheme);
});
