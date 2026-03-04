// Vercel Serverless Function para cálculo de frete
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

  // Verificar se o token está configurado
  if (!MELHOR_ENVIO_TOKEN) {
    console.error('[Shipping API] MELHOR_ENVIO_TOKEN não configurado!');
    return res.status(500).json({ 
      error: 'Token do Melhor Envio não configurado',
      debug: 'MELHOR_ENVIO_TOKEN is missing'
    });
  }

  try {
    // Chamar API Melhor Envio
    const meResponse = await fetch('https://api.melhorenvio.com.br/api/v2/me/shipment/calculate', {
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
      })
    });

    const responseText = await meResponse.text();
    
    if (!meResponse.ok) {
      console.error('[Shipping API] Melhor Envio error:', meResponse.status, responseText);
      return res.status(200).json({
        error: true,
        debug: {
          status: meResponse.status,
          message: responseText,
          token_prefix: MELHOR_ENVIO_TOKEN ? MELHOR_ENVIO_TOKEN.substring(0, 20) + '...' : 'NOT SET'
        },
        fallback: getFallback()
      });
    }

    const data = JSON.parse(responseText);
    
    // Filtrar apenas serviços com preço válido
    const services = data
      .filter(service => service.price && !service.error)
      .map(service => ({
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
    console.error('[Shipping API Error]', error.message);
    return res.status(200).json({
      error: true,
      debug: { message: error.message },
      fallback: getFallback()
    });
  }
}

function getFallback() {
  return [
    { id: 'pac', name: 'PAC', company: 'Correios', price: '15.00', delivery_time: 10, currency: 'R$' },
    { id: 'sedex', name: 'SEDEX', company: 'Correios', price: '25.00', delivery_time: 5, currency: 'R$' },
    { id: 'retirada-local', name: 'Retirada no Local', company: 'Santos Anjos 3D', price: '0.00', delivery_time: 0, currency: 'R$' }
  ];
}
