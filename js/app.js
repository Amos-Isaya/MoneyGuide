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

  if (existingProfile) {
    document.querySelector('.return-link').hidden = false;
    Object.keys(existingProfile).forEach(function (field) {
      if (form.elements.namedItem(field)) {
        form.elements.namedItem(field).value = existingProfile[field];
      }
    });
  }

  document.querySelector('[data-onboard]').addEventListener('click', function () {
    dialog.showModal();
  });
  nameInput.addEventListener('input', function () {
    nameInput.setCustomValidity('');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const firstName = nameInput.value.trim();
    if (!firstName) {
      nameInput.setCustomValidity('Please enter your first name.');
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
      window.location.href = 'dashboard.html';
    } catch (error) {
      document.querySelector('#form-error').textContent = 'Your browser could not save your answers. Please allow site storage and try again.';
    }
  });
}

if (document.body.dataset.page === 'dashboard') {
  const profile = getProfile();
  if (!profile) {
    window.location.replace('index.html');
  } else {
    // textContent displays user input safely as text, never as HTML.
    document.querySelector('#welcome-name').textContent = 'Welcome, ' + profile.firstName + ' 👋';
    document.querySelector('#profile-name').textContent = profile.firstName;
    document.querySelector('#profile-level').textContent = profile.knowledge + ' learner';
    document.querySelector('#avatar').textContent = Array.from(profile.firstName)[0].toUpperCase();
    document.querySelector('#user-goal').textContent = profile.goal;
    document.querySelector('#user-currency').textContent = profile.currency;
    document.querySelector('#dashboard-content').hidden = false;

    const dialog = document.querySelector('#info-dialog');
    function showPreview(title, description, isBudgeting) {
      document.querySelector('#info-title').textContent = title;
      document.querySelector('#info-description').textContent = description;
      document.querySelector('#info-label').textContent = isBudgeting ? 'MODULE PREVIEW' : 'ON THE HORIZON';
      document.querySelector('#budget-preview').hidden = !isBudgeting;
      dialog.showModal();
    }
    document.querySelector('#budgeting-button').addEventListener('click', function () {
      showPreview('Budgeting', 'Learn how to create and manage a budget.', true);
    });
    document.querySelectorAll('[data-feature]').forEach(function (button) {
      button.addEventListener('click', function () {
        showPreview(button.dataset.feature, 'Coming soon. This part of MoneyGuide is planned for a future step.', false);
      });
    });
  }
}
