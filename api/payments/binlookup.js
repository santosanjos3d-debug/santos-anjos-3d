// Vercel Serverless Function - BIN Lookup para descobrir bandeira do cartão
import { cors } from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { bin } = req.body || {};
    if (!bin || bin.length < 6) {
      return res.status(400).json({ error: 'BIN deve ter pelo menos 6 dígitos' });
    }

    const result = await fetch(`https://api.mercadopago.com/v1/payment_methods/search?bin=${bin}`, {
      headers: { 'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    }).then(r => r.json());

    console.log('[BIN Lookup] Result:', JSON.stringify(result));

    if (result.results && result.results.length > 0) {
      const method = result.results[0];
      return res.status(200).json({
        paymentMethodId: method.id,
        name: method.name,
        thumbnail: method.thumbnail,
      });
    }

    return res.status(404).json({ error: 'Bandeira não encontrada para este BIN' });
  } catch (err) {
    console.error('[BIN Lookup]', err);
    return res.status(500).json({ error: 'Erro ao consultar BIN' });
  }
}
