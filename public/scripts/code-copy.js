function makeButton(text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy';
  button.textContent = 'Copy';

  let reset;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Failed';
    }
    clearTimeout(reset);
    reset = setTimeout(() => {
      button.textContent = 'Copy';
    }, 1500);
  });

  return button;
}

if (navigator.clipboard) {
  for (const pre of document.querySelectorAll('main pre')) {
    const code = pre.querySelector('code');
    if (code) pre.prepend(makeButton(code.innerText));
  }
}
