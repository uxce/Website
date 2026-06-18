(function () {
  fetch('https://uxce.goatcounter.com/api/v0/stats/total', {
    headers: { 'Authorization': 'Bearer 1jbbnio8847f9i7o2coz99obfkjxz2rfdzdeliwkce1i5a727' } // yeah I know public API key. But it's just data broooooo.
  })
  .then(r => r.json())
  .then(data => {
    const el = document.getElementById('ctr');
    if (el) el.textContent = String(data.total).padStart(6, '0');
  })
  .catch(() => {
    const KEY = 'siteVisits_v1';
    let count = parseInt(localStorage.getItem(KEY) || '0', 10);
    if (!sessionStorage.getItem('counted')) {
      count++;
      localStorage.setItem(KEY, count);
      sessionStorage.setItem('counted', '1');
    }
    const el = document.getElementById('ctr');
    if (el) el.textContent = String(count).padStart(6, '0');
  });
})();