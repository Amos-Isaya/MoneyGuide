// Run before the styles load to avoid flashing the wrong theme on refresh.
(() => {
  let theme = 'dark';
  try {
    const saved = localStorage.getItem('moneyguide.theme');
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch (error) { /* The default theme still works when storage is unavailable. */ }
  document.documentElement.dataset.theme = theme;
})();
