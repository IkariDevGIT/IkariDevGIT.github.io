const wrap = document.getElementById('webdeck-embed');
const iframe = wrap?.querySelector('iframe');

function resize() {
  const scale = wrap.clientWidth / 600;
  iframe.style.transform = `scale(${scale})`;
  wrap.style.height = `${250 * scale}px`;
}

if (wrap && iframe) {
  addEventListener('resize', resize);
  resize();
}
