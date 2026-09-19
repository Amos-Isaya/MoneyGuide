// Both pages use the same key to find the profile saved in this browser.
const PROFILE_KEY = 'moneyguide.profile';
const currencies = ['USD', 'EUR', 'GBP', 'RWF', 'NGN', 'KES', 'Other'];
const goals = ['Manage my money better', 'Start saving', 'Build credit', 'Buy a car', 'Manage college expenses', 'Learn about investing'];
const levels = ['Beginner', 'Intermediate'];

function getProfile() {
  try {
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY));
    if (profile && typeof profile.firstName === 'string' && profile.firstName.trim() &&
        profile.firstName.length <= 40 && currencies.includes(profile.currency) &&
        goals.includes(profile.goal) && levels.includes(profile.knowledge)) {
      return profile;
    }
  } catch (error) {
    // Missing, damaged, or unavailable storage should not break the page.
    return null;
  }
  return null;
}

document.querySelectorAll('[data-close]').forEach(function (button) {
  button.addEventListener('click', function () {
    button.closest('dialog').close();
  });
});

if (document.body.dataset.page === 'home') {
  const dialog = document.querySelector('#onboarding-dialog');
  const form = document.querySelector('#onboarding-form');
  const nameInput = document.querySelector('#first-name');
  const existingProfile = getProfile();
  let destination = 'dashboard.html';

  if (existingProfile) {
    document.querySelector('.return-link').hidden = false;
    Object.keys(existingProfile).forEach(function (field) {
      if (form.elements.namedItem(field)) {
        form.elements.namedItem(field).value = existingProfile[field];
      }
    });
  }

  document.querySelector('[data-onboard]').addEventListener('click', function () {
    destination = 'dashboard.html';
    dialog.showModal();
  });
  // New learners return to their chosen feature after onboarding.
  document.querySelectorAll('[data-home-destination]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (getProfile() || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      destination = link.getAttribute('href');
      dialog.showModal();
    });
  });
  nameInput.addEventListener('input', function () {
    nameInput.setCustomValidity('');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const firstName = nameInput.value.trim();
    if (!firstName) {
      nameInput.setCustomValidity(MoneyGuideI18n.t('nameRequired'));
      nameInput.reportValidity();
      return;
    }
    const answers = new FormData(form);
    const profile = {
      firstName: firstName,
      currency: answers.get('currency'),
      goal: answers.get('goal'),
      knowledge: answers.get('knowledge')
    };

    try {
      // localStorage stores text, so we turn the profile object into JSON text.
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
      window.location.href = destination;
    } catch (error) {
      document.querySelector('#form-error').textContent = MoneyGuideI18n.t('storageError');
    }
  });
}
