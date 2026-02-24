// Vercel Serverless Function para cálculo de frete
import fetch from 'node-fetch';

const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const ORIGIN_CEP = process.env.MELHOR_ENVIO_ORIGIN_CEP || '89227320';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to_postal_code, packages } = req.body;

  if (!to_postal_code || !packages) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Chamar API Melhor Envio
    const response = await fetch('https://api.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
        'User-Agent': 'Santos Anjos 3D (contato@santosanjos3d.com.br)'
      },
      body: JSON.stringify({
        from: { postal_code: ORIGIN_CEP },
        to: { postal_code: to_postal_code },
        packages: packages
      }),
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Adicionar opção de retirada local
    const services = data.map(service => ({
      id: service.id,
      name: service.name,
      company: service.company.name,
      price: service.price,
      delivery_time: service.delivery_time,
      currency: 'R$'
    }));

    services.push({
      id: 'retirada-local',
      name: 'Retirada no Local',
      company: 'Santos Anjos 3D',
      price: '0.00',
      delivery_time: 0,
      currency: 'R$'
    });

    return res.status(200).json(services);

  } catch (error) {
    console.error('[Shipping API Error]', error);
    
    // Fallback para tabela estática
    return res.status(200).json([
      {
        id: 'pac',
        name: 'PAC',
        company: 'Correios',
        price: '15.00',
        delivery_time: 10,
        currency: 'R$'
      },
      {
        id: 'sedex',
        name: 'SEDEX',
        company: 'Correios',
        price: '25.00',
        delivery_time: 5,
        currency: 'R$'
      },
      {
        id: 'retirada-local',
        name: 'Retirada no Local',
        company: 'Santos Anjos 3D',
        price: '0.00',
        delivery_time: 0,
        currency: 'R$'
      }
    ]);
  }
}
