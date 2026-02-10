import axios from 'axios';

const MELHOR_ENVIO_API = 'https://api.melhorenvio.com.br/v2';
const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const ORIGIN_CEP = process.env.MELHOR_ENVIO_ORIGIN_CEP || '89227320';

interface ShippingRequest {
  destinationCEP: string;
  weight: number; // in grams
  height: number; // in cm
  width: number; // in cm
  length: number; // in cm
}

interface ShippingService {
  id: number;
  name: string;
  price: number;
  delivery_time: number;
  company: {
    name: string;
    picture: string;
  };
}

interface ShippingResponse {
  services: ShippingService[];
  error?: string;
}

function getAccessToken(): string {
  if (!MELHOR_ENVIO_TOKEN) {
    throw new Error('MELHOR_ENVIO_TOKEN not configured');
  }
  return MELHOR_ENVIO_TOKEN;
}

export async function calculateShipping(request: ShippingRequest): Promise<ShippingResponse> {
  try {
    const token = getAccessToken();

    console.log('[MelhorEnvio] Calculating shipping for CEP:', request.destinationCEP);

    // Convert weight from grams to kg
    const weightKg = request.weight / 1000;

    const response = await axios.post(
      `${MELHOR_ENVIO_API}/shipment/calculate`,
      {
        from: {
          postal_code: ORIGIN_CEP.replace('-', ''),
        },
        to: {
          postal_code: request.destinationCEP.replace('-', ''),
        },
        products: [
          {
            id: 1,
            width: request.width,
            height: request.height,
            length: request.length,
            weight: weightKg,
            quantity: 1,
            insurance_value: 0,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Melhor Envio (giorgiotestoni@gmail.com)',
        },
      }
    );

    const services = response.data.map((service: any) => ({
      id: service.id,
      name: service.name,
      price: parseFloat(service.price),
      delivery_time: service.delivery_time,
      company: {
        name: service.company,
        picture: service.picture,
      },
    }));

    console.log(`[MelhorEnvio] Calculated shipping for CEP ${request.destinationCEP}: ${services.length} services found`);

    return {
      services,
    };
  } catch (error: any) {
    console.error('[MelhorEnvio] Error calculating shipping');
    console.error('[MelhorEnvio] Status:', error.response?.status);
    console.error('[MelhorEnvio] Error:', error.response?.data || error.message);

    return {
      services: [],
      error: error.response?.data?.message || error.message || 'Failed to calculate shipping',
    };
  }
}

export async function validateCredentials(): Promise<boolean> {
  try {
    const token = getAccessToken();
    
    await axios.get(
      `${MELHOR_ENVIO_API}/me`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Melhor Envio (giorgiotestoni@gmail.com)',
        },
      }
    );
    
    console.log('[MelhorEnvio] Credentials validated successfully');
    return true;
  } catch (error: any) {
    console.error('[MelhorEnvio] Credential validation failed:', error.message);
    return false;
  }
}
