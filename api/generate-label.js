// Vercel Serverless Function - Geração de Etiqueta via Melhor Envio
import { query, cors } from './_lib/db.js';
import { requireAdmin } from './_lib/auth.js';

const ME_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const ME_BASE = 'https://melhorenvio.com.br/api/v2/me';

const SENDER = {
  name: 'Santos Anjos 3D',
  phone: '47996448774',
  email: 'santos.anjos3d@gmail.com',
  document: process.env.MELHOR_ENVIO_DOCUMENT || '05526634922',
  address: 'Rua Arthur Zoefeldt',
  number: '307',
  district: 'Iririú',
  city: 'Joinville',
  state_abbr: 'SC',
  country_id: 'BR',
  postal_code: process.env.MELHOR_ENVIO_ORIGIN_CEP || '89227320',
};

async function mePost(path, body) {
  const resp = await fetch(`${ME_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ME_TOKEN}`,
      'User-Agent': 'Santos Anjos 3D (santos.anjos3d@gmail.com)',
    },
    body: JSON.stringify(body),
  });
  const text = await resp.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }
  if (!resp.ok) throw new Error(`${resp.status} — ${text.substring(0, 300)}`);
  return data;
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ok = await requireAdmin(req, res);
  if (!ok) return;

  const { orderId } = req.body || {};
  if (!orderId) return res.status(400).json({ error: 'orderId é obrigatório' });

  try {
    // Buscar pedido
    const [order] = await query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    const items = order.itemsSummary ? JSON.parse(order.itemsSummary) : [];

    // Dimensões padrão baseadas no maior item
    const pkg = { height: 15, width: 15, length: 30, weight: 0.5 };

    // 1. Adicionar ao carrinho
    const cartItem = await mePost('/cart', {
      service: order.shippingServiceId,
      agency: null,
      from: {
        name: SENDER.name,
        phone: SENDER.phone,
        email: SENDER.email,
        document: SENDER.document,
        address: SENDER.address,
        number: SENDER.number,
        district: SENDER.district,
        city: SENDER.city,
        state_abbr: SENDER.state_abbr,
        country_id: SENDER.country_id,
        postal_code: SENDER.postal_code,
      },
      to: {
        name: order.customerName,
        phone: order.customerPhone,
        document: order.customerDocument,
        address: order.addressStreet,
        number: order.addressNumber,
        complement: order.addressComplement || '',
        district: order.addressDistrict,
        city: order.addressCity,
        state_abbr: order.addressState,
        country_id: 'BR',
        postal_code: order.addressPostalCode,
      },
      products: items.map(item => ({
        name: item.name || 'Escultura 3D',
        quantity: item.qty || 1,
        unitary_value: parseFloat(String(item.price || '0').replace(',', '.')),
      })),
      volumes: [pkg],
      options: {
        insurance_value: parseFloat(order.totalPrice) || 0,
        receipt: false,
        own_hand: false,
        reverse: false,
        non_commercial: false,
        invoice: { key: '' },
        tags: [{ tag: order.orderNumber, url: null }],
      },
    });

    const meOrderId = cartItem.id;

    // 2. Comprar frete
    await mePost('/shipment/checkout', { orders: [meOrderId] });

    // 3. Gerar etiqueta
    await mePost('/shipment/generate', { orders: [meOrderId] });

    // 4. Buscar URL da etiqueta
    const preview = await mePost('/shipment/preview', { orders: [meOrderId] });
    const labelUrl = preview?.url || preview?.[meOrderId]?.url || null;

    // 5. Buscar código de rastreio
    let trackingCode = null;
    try {
      const tracking = await mePost('/shipment/tracking', { orders: [meOrderId] });
      trackingCode = tracking?.[meOrderId]?.tracking || null;
    } catch { /* rastreio pode não estar disponível imediatamente */ }

    // 6. Atualizar pedido no banco
    await query(
      `UPDATE orders SET
        melhorEnvioOrderId = ?,
        labelUrl = ?,
        trackingCode = ?,
        status = 'processing',
        updatedAt = NOW()
       WHERE id = ?`,
      [meOrderId, labelUrl, trackingCode, orderId]
    );

    return res.status(200).json({
      success: true,
      meOrderId,
      labelUrl,
      trackingCode,
    });
  } catch (err) {
    console.error('[Generate Label]', err);
    return res.status(500).json({ error: 'Erro ao gerar etiqueta: ' + err.message });
  }
}
