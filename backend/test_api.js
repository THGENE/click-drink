const axios = require('axios');

(async () => {
  try {
    const res = await axios.get('http://localhost:3001/');
    console.log('Réponse backend:', res.data);
  } catch (e) {
    console.error('Erreur API:', e.message);
  }
})();
