const el = document.getElementById('visitor-count');

if (el) {
  const now = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  fetch(`https://ikaridev.goatcounter.com/counter/TOTAL.json?start=${monthStart}`)
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((data) => {
      el.textContent = String(data.count);
    })
    .catch(() => {
      el.textContent = '?';
    });
}
