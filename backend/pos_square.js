// Intégration POS Square (exemple de base)
// Pour une intégration complète, il faut créer une app sur https://developer.squareup.com/apps
// et renseigner les credentials dans le .env

const axios = require('axios');

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID;

const squareApi = axios.create({
  baseURL: 'https://connect.squareup.com/v2',
  headers: {
    'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

async function listPayments() {
  const res = await squareApi.get(`/payments?location_id=${SQUARE_LOCATION_ID}`);
  return res.data;
}

module.exports = { listPayments };
