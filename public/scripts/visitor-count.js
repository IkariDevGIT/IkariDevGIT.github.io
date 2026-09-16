const el = document.getElementById('visitor-count');

if (el) {
  const monthStart = el.dataset.monthStart;

  fetch(`https://ikaridev.goatcounter.com/counter/TOTAL.json?start=${monthStart}`)
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((data) => {
      el.textContent = String(data.count);
    })
    .catch(() => {
      el.textContent = '?';
    });
}
