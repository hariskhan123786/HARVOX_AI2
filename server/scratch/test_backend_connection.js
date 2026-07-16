async function checkHealth() {
  try {
    const res = await fetch('https://harvoxai2-production.up.railway.app/api/health');
    console.log('Status Code:', res.status);
    const body = await res.json();
    console.log('Response Body:', body);
  } catch (err) {
    console.log('Connection failed:', err.message);
  }
}
checkHealth();
