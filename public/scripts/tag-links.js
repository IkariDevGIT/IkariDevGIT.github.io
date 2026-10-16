document.documentElement.classList.add('tag-links');

document.addEventListener('click', (event) => {
  const tag = event.target.closest('.tag');
  if (!tag) return;

  event.preventDefault();
  const url = `/blog/?tag=${encodeURIComponent(tag.textContent.trim())}`;
  if (event.ctrlKey || event.metaKey) window.open(url, '_blank');
  else location.href = url;
});
