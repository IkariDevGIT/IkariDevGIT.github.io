const STORAGE_KEY = 'comment-rules-ok';

function hasConsent() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function setConsent() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // no storage available, will just ask again next time
  }
}

function main() {
  const rules = document.getElementById('comments-rules');
  const widget = document.getElementById('comments-widget');
  const acceptButton = document.getElementById('comments-accept');

  if (!rules || !widget || !acceptButton) return;

  if (hasConsent()) {
    widget.classList.remove('is-locked');
    return;
  }

  rules.hidden = false;

  acceptButton.addEventListener('click', () => {
    setConsent();
    rules.hidden = true;
    widget.classList.remove('is-locked');
  });
}

main();
