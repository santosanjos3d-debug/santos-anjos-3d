// Vercel Serverless Function para cálculo de frete
const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const ORIGIN_CEP = process.env.MELHOR_ENVIO_ORIGIN_CEP || '89227320';

// URL correta da API do Melhor Envio (sem prefixo api.)
const MELHOR_ENVIO_URL = 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

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

  // Converter packages para volumes (formato correto da API do Melhor Envio)
  const volumes = packages.map(pkg => ({
    height: pkg.height || 15,
    width: pkg.width || 15,
    length: pkg.length || 30,
    weight: pkg.weight || 0.5
  }));

  // Tentar Melhor Envio se token disponível
  if (MELHOR_ENVIO_TOKEN) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const meResponse = await fetch(MELHOR_ENVIO_URL, {
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
          volumes: volumes
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (meResponse.ok) {
        const data = await meResponse.json();
        
        // Verificar se retornou um array válido
        if (!Array.isArray(data)) {
          console.error('[Shipping API] Resposta inválida do Melhor Envio:', data);
          throw new Error('Resposta inválida');
        }

        // IDs das transportadoras permitidas
        const ALLOWED_IDS = [2, 3, 33]; // SEDEX, Jadlog .Package, JeT Standard

        // Filtrar apenas os serviços desejados com preço válido
        const services = data
          .filter(service => ALLOWED_IDS.includes(service.id) && service.price && !service.error)
          .map(service => ({
            id: service.id,
            name: service.name,
            company: service.company?.name || service.company,
            price: service.price,
            delivery_time: service.delivery_time,
            currency: 'R$'
          }));

        // Adicionar retirada local
        services.push({
          id: 'retirada-local',
          name: 'Retirada no Local',
          company: 'Santos Anjos 3D',
          price: '0.00',
          delivery_time: 0,
          currency: 'R$'
        });

        if (services.length > 1) {
          return res.status(200).json(services);
        }
        
        console.error('[Shipping API] Nenhum serviço disponível do Melhor Envio');
      } else {
        const errorText = await meResponse.text();
        console.error('[Shipping API] Melhor Envio retornou status:', meResponse.status, errorText.substring(0, 200));
      }
    } catch (error) {
      console.error('[Shipping API] Erro ao chamar Melhor Envio:', error.message);
    }
  } else {
    console.warn('[Shipping API] MELHOR_ENVIO_TOKEN não configurado, usando fallback');
  }

  // Fallback com valores estimados
  return res.status(200).json([
    {
      id: 'pac',
      name: 'PAC (estimativa)',
      company: 'Correios',
      price: '15.00',
      delivery_time: 10,
      currency: 'R$'
    },
    {
      id: 'sedex',
      name: 'SEDEX (estimativa)',
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
