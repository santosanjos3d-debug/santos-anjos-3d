// Endpoint temporário de diagnóstico - REMOVER APÓS TESTES
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const TOKEN = process.env.MELHOR_ENVIO_TOKEN;
  const results = {
    token_configured: !!TOKEN,
    token_prefix: TOKEN ? TOKEN.substring(0, 30) + '...' : 'NOT SET',
    origin_cep: process.env.MELHOR_ENVIO_ORIGIN_CEP || 'NOT SET',
    timestamp: new Date().toISOString(),
  };

  // Testar DNS
  try {
    const dnsResponse = await fetch('https://api.melhorenvio.com.br/', {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    results.dns_ok = true;
    results.dns_status = dnsResponse.status;
  } catch (err) {
    results.dns_ok = false;
    results.dns_error = err.message;
  }

  // Testar API real se DNS ok
  if (results.dns_ok && TOKEN) {
    try {
      const meResponse = await fetch('https://api.melhorenvio.com.br/api/v2/me/shipment/calculate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`,
          'User-Agent': 'Santos Anjos 3D (contato@santosanjos3d.com.br)'
        },
        body: JSON.stringify({
          from: { postal_code: '89227320' },
          to: { postal_code: '01310100' },
          packages: [{ height: 15, width: 15, length: 30, weight: 0.8 }]
        }),
        signal: AbortSignal.timeout(10000)
      });
      results.api_status = meResponse.status;
      const data = await meResponse.json();
      results.api_response = JSON.stringify(data).substring(0, 500);
    } catch (err) {
      results.api_error = err.message;
    }
  }

  return res.status(200).json(results);
}
