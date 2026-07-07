// Vercel Serverless Function - Criar pagamento via Mercado Pago
import { query, cors, runMigration } from '../_lib/db.js';

const MP_API = 'https://api.mercadopago.com/v1/payments';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // BIN Lookup action
  const action = req.query?.action;
  if (action === 'binlookup' && req.method === 'POST') {
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
        return res.status(200).json({ paymentMethodId: method.id, name: method.name, thumbnail: method.thumbnail });
      }
      return res.status(404).json({ error: 'Bandeira não encontrada' });
    } catch (err) {
      console.error('[BIN Lookup]', err);
      return res.status(500).json({ error: 'Erro ao consultar BIN' });
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await runMigration();

    const { orderId, paymentMethod, cardToken, paymentMethodId, installments, identification } = req.body || {};

    if (!orderId || !paymentMethod) {
      return res.status(400).json({ error: 'orderId e paymentMethod são obrigatórios' });
    }

    const orders = await query('SELECT * FROM orders WHERE id = ? OR orderNumber = ?', [orderId, orderId]);
    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    const order = orders[0];

    const paymentData = {
      transaction_amount: parseFloat(String(order.totalPrice)),
      description: `Pedido ${order.orderNumber} - Santos Anjos 3D`,
      external_reference: String(order.id),
    };

    if (paymentMethod === 'pix') {
      paymentData.payment_method_id = 'pix';
      paymentData.payer = {
        email: order.customerEmail || 'cliente@santosanjos3d.com.br',
        first_name: order.customerName?.split(' ')[0] || 'Cliente',
        last_name: order.customerName?.split(' ').slice(1).join(' ') || 'Santos Anjos 3D',
        identification: {
          type: 'CPF',
          number: order.customerDocument?.replace(/\D/g, '') || '00000000000',
        },
      };
    } else if (paymentMethod === 'card') {
      if (!cardToken) {
        return res.status(400).json({ error: 'cardToken é obrigatório para pagamento com cartão' });
      }
      paymentData.token = cardToken;
      paymentData.payment_method_id = paymentMethodId || 'visa';
      paymentData.installments = installments || 1;
      paymentData.payer = {
        email: order.customerEmail || 'cliente@santosanjos3d.com.br',
        identification: {
          type: 'CPF',
          number: identification?.number?.replace(/\D/g, '') || order.customerDocument?.replace(/\D/g, '') || '00000000000',
        },
      };
      console.log('[Payments CREATE] Card payment data:', JSON.stringify({ token: cardToken, paymentMethodId: paymentMethodId || 'visa', installments }));
    } else {
      return res.status(400).json({ error: 'paymentMethod deve ser "pix" ou "card"' });
    }

    const result = await fetch(MP_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'X-Idempotency-Key': `${orderId}-${Date.now()}`,
      },
      body: JSON.stringify(paymentData),
    }).then(r => r.json());

    console.log('[Payments CREATE] MP response:', JSON.stringify({ id: result.id, status: result.status, error: result.error, message: result.message, hasPointOfInteraction: !!result.point_of_interaction, hasTxData: !!result.point_of_interaction?.transaction_data, keys: Object.keys(result).join(',') }));

    if (result.id) {
      // Se não veio point_of_interaction, buscar detalhes do pagamento
      if (paymentMethod === 'pix' && !result.point_of_interaction?.transaction_data) {
        console.log('[Payments CREATE] No POI in response, fetching payment details for id:', result.id);
        const details = await fetch(`${MP_API}/${result.id}`, {
          headers: { 'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
        }).then(r => r.json());
        console.log('[Payments CREATE] Payment details:', JSON.stringify({ hasPOI: !!details.point_of_interaction, hasTxData: !!details.point_of_interaction?.transaction_data, status: details.status }));
        if (details.point_of_interaction?.transaction_data) {
          result.point_of_interaction = details.point_of_interaction;
        }
      }

      const updateFields = {
        paymentMethod,
        paymentStatus: result.status || 'pending',
        mercadopagoPaymentId: String(result.id),
      };

      if (paymentMethod === 'pix' && result.point_of_interaction?.transaction_data) {
        updateFields.pixQrCodeBase64 = result.point_of_interaction.transaction_data.qr_code_base64 || null;
        updateFields.pixCopyPaste = result.point_of_interaction.transaction_data.qr_code || null;
      }

      if (paymentMethod === 'card') {
        updateFields.cardBrand = result.payment_method_id || null;
        updateFields.cardInstallments = installments || 1;
        if (result.status === 'approved') {
          updateFields.status = 'paid';
        }
      }

      const setClauses = [];
      const values = [];
      for (const [key, value] of Object.entries(updateFields)) {
        if (value !== undefined && value !== null) {
          setClauses.push(`${key} = ?`);
          values.push(value);
        }
      }
      if (setClauses.length > 0) {
        values.push(order.id);
        await query(`UPDATE orders SET ${setClauses.join(', ')} WHERE id = ?`, values);
      }
    }

    if (result.error) {
      console.error('[Payments CREATE] MercadoPago error:', JSON.stringify(result));
      return res.status(500).json({ error: result.message || 'Erro ao criar pagamento', details: result });
    }

    const response = {
      paymentId: result.id,
      status: result.status,
      paymentMethod,
    };

    if (paymentMethod === 'pix') {
      const txData = result.point_of_interaction?.transaction_data;
      if (txData) {
        response.pixQrCode = txData.qr_code_base64;
        response.pixCopyPaste = txData.qr_code;
        response.pixExpiration = result.date_of_expiration;
      }
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('[Payments CREATE]', err);
    return res.status(500).json({ error: 'Erro ao criar pagamento', details: err.message || String(err) });
  }
}

function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${protocol}://${host}`;
}
