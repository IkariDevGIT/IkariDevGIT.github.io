const STORAGE_KEY = 'nsfw-ok';

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
  const gate = document.getElementById('nsfw-gate');
  const prompt = document.getElementById('nsfw-gate-prompt');
  const content = document.getElementById('post-content');
  const yesButton = document.getElementById('nsfw-yes');
  const noButton = document.getElementById('nsfw-no');

  if (!gate || !prompt || !content || !yesButton || !noButton) return;

  if (hasConsent()) {
    gate.hidden = true;
    content.hidden = false;
    return;
  }

  prompt.hidden = false;

  yesButton.addEventListener('click', () => {
    setConsent();
    gate.hidden = true;
    content.hidden = false;
  });

  noButton.addEventListener('click', () => {
    location.href = '/';
  });
}

main();
