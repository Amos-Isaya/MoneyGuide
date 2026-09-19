// Original outline icons share one viewBox and stroke weight. No icon library needed.
const MoneyGuideCards = (() => {
  const paths = {
    learn: '<path d="M24 12C18 8 10 8 5 10v27c6-2 13-2 19 2 6-4 13-4 19-2V10c-5-2-13-2-19 2Z"/><path d="M24 12v27M11 17h7M11 23h7M30 17h7M30 23h7"/>',
    practice: '<circle cx="24" cy="24" r="17"/><circle cx="24" cy="24" r="9"/><path d="m24 24 17-17M34 7h7v7"/>',
    tools: '<rect x="10" y="5" width="28" height="38" rx="4"/><path d="M16 12h16v8H16zM16 27h3M29 27h3M16 34h3M29 34h3"/>',
    progress: '<path d="M7 7v34h34M14 31l9-10 7 5 11-15M33 11h8v8"/>',
    certificate: '<path d="M29 37H7V7h34v20M14 15h20M14 22h13"/><circle cx="34" cy="31" r="7"/><path d="m29 36-2 8 7-3 7 3-2-8"/>',
    coach: '<path d="m24 7 4 12 12 5-12 4-4 13-5-13-12-4 12-5ZM38 4v8M34 8h8M8 35v8M4 39h8"/>',
    savings: '<path d="M8 22h32v19H8zM13 22v-6h22v6M24 28v7"/><circle cx="24" cy="8" r="5"/>',
    budget: '<rect x="8" y="7" width="32" height="35" rx="3"/><path d="M16 4v7M32 4v7M8 18h32M15 25h7M15 33h7M29 25h4M29 33h4"/>',
    growth: '<path d="M7 40h35M11 35V24h6v11M22 35V18h6v17M33 35V9h6v26M8 17 20 8h8"/>',
    loan: '<path d="M6 39h36M10 35V21M20 35V21M29 35V21M38 35V21M6 17 24 6l18 11H6Z"/>',
    currency: '<path d="M8 16h31l-7-7M40 32H9l7 7"/><circle cx="24" cy="24" r="6"/>',
    arrow: '<path d="M7 24h33M29 13l11 11-11 11"/>',
    check: '<path d="m10 25 9 9 20-21"/>'
  };
  function icon(name, className = '') {
    return `<svg class="line-icon ${className}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.learn}</svg>`;
  }
  function arrow() { return icon('arrow', 'card-arrow'); }
  function fillIcons() {
    document.querySelectorAll('[data-icon]').forEach(node => { node.innerHTML = icon(node.dataset.icon); });
  }
  function showComingSoon(title, description) {
    let dialog = document.querySelector('#feature-preview');
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.id = 'feature-preview';
      dialog.setAttribute('aria-labelledby', 'feature-preview-title');
      dialog.innerHTML = '<button class="close-button" type="button">×</button><p class="eyebrow" id="feature-preview-status"></p><h2 id="feature-preview-title"></h2><p id="feature-preview-description"></p>';
      document.body.append(dialog);
      dialog.querySelector('button').addEventListener('click', () => dialog.close());
    }
    dialog.querySelector('button').setAttribute('aria-label', MoneyGuideI18n.t('close'));
    dialog.querySelector('#feature-preview-status').textContent = MoneyGuideI18n.t('soon');
    dialog.querySelector('#feature-preview-title').textContent = title;
    dialog.querySelector('#feature-preview-description').textContent = description;
    dialog.showModal();
  }
  document.addEventListener('DOMContentLoaded', fillIcons);
  document.addEventListener('click', event => {
    const card = event.target.closest('[data-coming-soon]');
    if (card) showComingSoon(MoneyGuideI18n.t(card.dataset.comingSoon), MoneyGuideI18n.t(card.dataset.previewDescription));
  });
  return { icon, arrow, fillIcons };
})();
