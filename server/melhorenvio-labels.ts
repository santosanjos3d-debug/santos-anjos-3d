/**
 * Integração com a API do Melhor Envio para geração de etiquetas
 * Documentação: https://docs.melhorenvio.com.br/
 *
 * Fluxo:
 * 1. Adicionar envio ao carrinho (POST /me/cart)
 * 2. Comprar o frete (POST /me/shipment/checkout) — debita do saldo
 * 3. Gerar etiqueta (POST /me/shipment/generate) — retorna PDF
 * 4. Imprimir etiqueta (POST /me/shipment/print) — URL do PDF
 */

const ME_BASE_URL = 'https://melhorenvio.com.br/api/v2';
const ORIGIN_CEP = process.env.MELHOR_ENVIO_ORIGIN_CEP || '89227320';

// Dados do remetente (loja) — endereço completo obrigatório para geração de etiqueta
const SENDER = {
  name: 'Santos Anjos 3D',
  phone: '47996641959',
  email: 'santos.anjos3d@gmail.com',
  document: process.env.MELHOR_ENVIO_DOCUMENT || '05526634922',
  address: 'Rua Arthur Zoefeldt',
  number: '307',
  complement: '',
  district: 'Iririú',
  city: 'Joinville',
  state_abbr: 'SC',
  postal_code: ORIGIN_CEP,
  country_id: 'BR',
};

function getHeaders() {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) throw new Error('MELHOR_ENVIO_TOKEN não configurado');
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'User-Agent': 'Santos Anjos 3D (contato@santosanjos3d.com.br)',
  };
}

export interface OrderForLabel {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  customerDocument: string | null;
  addressPostalCode: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressDistrict: string | null;
  addressCity: string | null;
  addressState: string | null;
  shippingServiceId: number | null;
  itemsSummary: string | null;
  totalPrice: string;
}

/**
 * Estima dimensões do pacote com base nos itens do pedido
 */
function estimatePackageDimensions(itemsSummary: string | null) {
  // Padrão: caixa média para 1 peça
  return {
    height: 15,
    width: 15,
    length: 25,
    weight: 0.5, // kg
  };
}

/**
 * Passo 1: Adicionar envio ao carrinho do Melhor Envio
 * Retorna o ID do item no carrinho
 */
export async function addToMelhorEnvioCart(order: OrderForLabel): Promise<string> {
  const dimensions = estimatePackageDimensions(order.itemsSummary);

  const payload = {
    service: order.shippingServiceId,
    agency: null,
    from: {
      name: SENDER.name,
      phone: SENDER.phone,
      email: SENDER.email,
      document: SENDER.document,
      address: SENDER.address,
      number: SENDER.number,
      complement: SENDER.complement || undefined,
      district: SENDER.district,
      city: SENDER.city,
      state_abbr: SENDER.state_abbr,
      postal_code: SENDER.postal_code,
      country_id: SENDER.country_id,
    },
    to: {
      name: order.customerName,
      phone: order.customerPhone?.replace(/\D/g, '') || '',
      email: null,
      document: order.customerDocument?.replace(/\D/g, '') || undefined,
      address: order.addressStreet,
      number: order.addressNumber,
      complement: order.addressComplement || undefined,
      district: order.addressDistrict,
      city: order.addressCity,
      state_abbr: order.addressState,
      postal_code: order.addressPostalCode?.replace(/\D/g, ''),
      country_id: 'BR',
    },
    products: [
      {
        name: 'Arte Sacra 3D',
        quantity: 1,
        unitary_value: parseFloat(order.totalPrice),
      },
    ],
    volumes: [
      {
        height: dimensions.height,
        width: dimensions.width,
        length: dimensions.length,
        weight: dimensions.weight,
      },
    ],
    options: {
      insurance_value: parseFloat(order.totalPrice),
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: false,
      invoice: {
        key: null,
      },
      tags: [
        {
          tag: order.orderNumber,
          url: null,
        },
      ],
    },
  };

  const response = await fetch(`${ME_BASE_URL}/me/cart`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao adicionar ao carrinho ME: ${response.status} — ${errorText.substring(0, 300)}`);
  }

  const data = await response.json();
  console.log('[MelhorEnvio] Adicionado ao carrinho:', data.id);
  return data.id as string;
}

/**
 * Passo 2: Comprar o frete (debita do saldo da conta)
 * Retorna o protocolo de compra
 */
export async function purchaseMelhorEnvioShipment(cartItemIds: string[]): Promise<string> {
  const response = await fetch(`${ME_BASE_URL}/me/shipment/checkout`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orders: cartItemIds }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao comprar frete ME: ${response.status} — ${errorText.substring(0, 300)}`);
  }

  const data = await response.json();
  console.log('[MelhorEnvio] Frete comprado:', data);
  // Retorna o ID do primeiro pedido comprado
  return cartItemIds[0];
}

/**
 * Passo 3: Gerar a etiqueta
 */
export async function generateMelhorEnvioLabel(orderId: string): Promise<void> {
  const response = await fetch(`${ME_BASE_URL}/me/shipment/generate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ orders: [orderId] }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao gerar etiqueta ME: ${response.status} — ${errorText.substring(0, 300)}`);
  }

  console.log('[MelhorEnvio] Etiqueta gerada para:', orderId);
}

/**
 * Passo 4: Obter URL de impressão da etiqueta (PDF)
 */
export async function printMelhorEnvioLabel(orderId: string): Promise<string> {
  const response = await fetch(`${ME_BASE_URL}/me/shipment/print`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      mode: 'private',
      orders: [orderId],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao imprimir etiqueta ME: ${response.status} — ${errorText.substring(0, 300)}`);
  }

  const data = await response.json();
  console.log('[MelhorEnvio] URL da etiqueta:', data.url);
  return data.url as string;
}

/**
 * Fluxo completo: adiciona ao carrinho → compra → gera → obtém URL
 * Retorna { melhorEnvioOrderId, labelUrl }
 */
export async function generateLabelForOrder(order: OrderForLabel): Promise<{
  melhorEnvioOrderId: string;
  labelUrl: string;
}> {
  // 1. Adicionar ao carrinho
  const cartItemId = await addToMelhorEnvioCart(order);

  // 2. Comprar o frete
  await purchaseMelhorEnvioShipment([cartItemId]);

  // 3. Gerar a etiqueta
  await generateMelhorEnvioLabel(cartItemId);

  // 4. Obter URL de impressão
  const labelUrl = await printMelhorEnvioLabel(cartItemId);

  return {
    melhorEnvioOrderId: cartItemId,
    labelUrl,
  };
}

/**
 * Buscar informações de rastreio de um envio
 */
export async function trackMelhorEnvioShipment(orderId: string): Promise<{
  trackingCode: string | null;
  status: string;
}> {
  const response = await fetch(`${ME_BASE_URL}/me/orders/${orderId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar rastreio: ${response.status}`);
  }

  const data = await response.json();
  return {
    trackingCode: data.tracking || null,
    status: data.status || 'unknown',
  };
}
