// Tabela de frete baseada em regiões e tamanhos
// Valores aproximados baseados em PAC e SEDEX dos Correios

interface ShippingRate {
  pac: { price: number; days: number };
  sedex: { price: number; days: number };
}

interface ShippingTable {
  [size: string]: {
    [region: string]: ShippingRate;
  };
}

// Mapeamento de CEP para região
const CEP_REGIONS: { [key: string]: string } = {
  // Santa Catarina (origem: 89227-320)
  '88': 'SC', '89': 'SC',
  
  // Sul
  '80': 'PR', '81': 'PR', '82': 'PR', '83': 'PR', '84': 'PR', '85': 'PR', '86': 'PR', '87': 'PR',
  '90': 'RS', '91': 'RS', '92': 'RS', '93': 'RS', '94': 'RS', '95': 'RS', '96': 'RS', '97': 'RS', '98': 'RS', '99': 'RS',
  
  // Sudeste
  '01': 'SP', '02': 'SP', '03': 'SP', '04': 'SP', '05': 'SP', '06': 'SP', '07': 'SP', '08': 'SP', '09': 'SP',
  '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP', '16': 'SP', '17': 'SP', '18': 'SP', '19': 'SP',
  '20': 'RJ', '21': 'RJ', '22': 'RJ', '23': 'RJ', '24': 'RJ', '25': 'RJ', '26': 'RJ', '27': 'RJ', '28': 'RJ',
  '30': 'MG', '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG', '35': 'MG', '36': 'MG', '37': 'MG', '38': 'MG', '39': 'MG',
  '29': 'ES',
  
  // Centro-Oeste
  '70': 'DF', '71': 'DF', '72': 'DF', '73': 'DF',
  '74': 'GO', '75': 'GO', '76': 'GO',
  '78': 'MT', '79': 'MT',
  
  // Nordeste
  '40': 'BA', '41': 'BA', '42': 'BA', '43': 'BA', '44': 'BA', '45': 'BA', '46': 'BA', '47': 'BA', '48': 'BA',
  '49': 'SE',
  '50': 'PE', '51': 'PE', '52': 'PE', '53': 'PE', '54': 'PE', '55': 'PE', '56': 'PE',
  '57': 'AL',
  '58': 'PB',
  '59': 'RN',
  '60': 'CE', '61': 'CE', '62': 'CE', '63': 'CE',
  '64': 'PI',
  '65': 'MA',
  
  // Norte
  '68': 'AC',
  '69': 'RO',
  '77': 'TO',
  '66': 'AP',
  '67': 'AM',
};

// Tabela de preços por tamanho e região
const SHIPPING_TABLE: ShippingTable = {
  'P': { // 8x8x15cm, 100g
    'SC': { pac: { price: 15.50, days: 3 }, sedex: { price: 25.00, days: 1 } },
    'PR': { pac: { price: 18.00, days: 4 }, sedex: { price: 28.50, days: 2 } },
    'RS': { pac: { price: 19.50, days: 5 }, sedex: { price: 30.00, days: 2 } },
    'SP': { pac: { price: 22.00, days: 6 }, sedex: { price: 35.00, days: 3 } },
    'RJ': { pac: { price: 24.00, days: 7 }, sedex: { price: 38.00, days: 3 } },
    'MG': { pac: { price: 23.00, days: 7 }, sedex: { price: 36.50, days: 3 } },
    'ES': { pac: { price: 24.50, days: 7 }, sedex: { price: 39.00, days: 3 } },
    'DF': { pac: { price: 26.00, days: 8 }, sedex: { price: 42.00, days: 4 } },
    'GO': { pac: { price: 26.50, days: 8 }, sedex: { price: 42.50, days: 4 } },
    'MT': { pac: { price: 28.00, days: 9 }, sedex: { price: 45.00, days: 5 } },
    'BA': { pac: { price: 27.00, days: 9 }, sedex: { price: 43.50, days: 5 } },
    'SE': { pac: { price: 28.50, days: 10 }, sedex: { price: 46.00, days: 5 } },
    'PE': { pac: { price: 29.00, days: 10 }, sedex: { price: 47.00, days: 6 } },
    'AL': { pac: { price: 29.50, days: 10 }, sedex: { price: 47.50, days: 6 } },
    'PB': { pac: { price: 30.00, days: 11 }, sedex: { price: 48.50, days: 6 } },
    'RN': { pac: { price: 30.50, days: 11 }, sedex: { price: 49.00, days: 6 } },
    'CE': { pac: { price: 31.00, days: 11 }, sedex: { price: 50.00, days: 6 } },
    'PI': { pac: { price: 31.50, days: 12 }, sedex: { price: 51.00, days: 7 } },
    'MA': { pac: { price: 32.00, days: 12 }, sedex: { price: 52.00, days: 7 } },
    'AC': { pac: { price: 35.00, days: 14 }, sedex: { price: 58.00, days: 8 } },
    'RO': { pac: { price: 34.00, days: 13 }, sedex: { price: 56.00, days: 8 } },
    'RR': { pac: { price: 36.00, days: 15 }, sedex: { price: 60.00, days: 9 } },
    'TO': { pac: { price: 32.50, days: 12 }, sedex: { price: 53.00, days: 7 } },
    'AP': { pac: { price: 36.50, days: 15 }, sedex: { price: 61.00, days: 9 } },
    'AM': { pac: { price: 35.50, days: 14 }, sedex: { price: 59.00, days: 8 } },
  },
  'M': { // 10x10x23cm, 150g
    'SC': { pac: { price: 18.50, days: 3 }, sedex: { price: 30.00, days: 1 } },
    'PR': { pac: { price: 21.50, days: 4 }, sedex: { price: 34.00, days: 2 } },
    'RS': { pac: { price: 23.00, days: 5 }, sedex: { price: 36.00, days: 2 } },
    'SP': { pac: { price: 26.50, days: 6 }, sedex: { price: 42.00, days: 3 } },
    'RJ': { pac: { price: 29.00, days: 7 }, sedex: { price: 45.50, days: 3 } },
    'MG': { pac: { price: 27.50, days: 7 }, sedex: { price: 43.50, days: 3 } },
    'ES': { pac: { price: 29.50, days: 7 }, sedex: { price: 46.50, days: 3 } },
    'DF': { pac: { price: 31.50, days: 8 }, sedex: { price: 50.50, days: 4 } },
    'GO': { pac: { price: 32.00, days: 8 }, sedex: { price: 51.00, days: 4 } },
    'MT': { pac: { price: 34.00, days: 9 }, sedex: { price: 54.00, days: 5 } },
    'BA': { pac: { price: 32.50, days: 9 }, sedex: { price: 52.00, days: 5 } },
    'SE': { pac: { price: 34.50, days: 10 }, sedex: { price: 55.00, days: 5 } },
    'PE': { pac: { price: 35.00, days: 10 }, sedex: { price: 56.50, days: 6 } },
    'AL': { pac: { price: 35.50, days: 10 }, sedex: { price: 57.00, days: 6 } },
    'PB': { pac: { price: 36.00, days: 11 }, sedex: { price: 58.00, days: 6 } },
    'RN': { pac: { price: 36.50, days: 11 }, sedex: { price: 58.50, days: 6 } },
    'CE': { pac: { price: 37.50, days: 11 }, sedex: { price: 60.00, days: 6 } },
    'PI': { pac: { price: 38.00, days: 12 }, sedex: { price: 61.00, days: 7 } },
    'MA': { pac: { price: 38.50, days: 12 }, sedex: { price: 62.00, days: 7 } },
    'AC': { pac: { price: 42.00, days: 14 }, sedex: { price: 69.00, days: 8 } },
    'RO': { pac: { price: 41.00, days: 13 }, sedex: { price: 67.00, days: 8 } },
    'RR': { pac: { price: 43.50, days: 15 }, sedex: { price: 72.00, days: 9 } },
    'TO': { pac: { price: 39.00, days: 12 }, sedex: { price: 63.50, days: 7 } },
    'AP': { pac: { price: 44.00, days: 15 }, sedex: { price: 73.00, days: 9 } },
    'AM': { pac: { price: 42.50, days: 14 }, sedex: { price: 70.50, days: 8 } },
  },
  'G': { // 15x15x30cm, 250g
    'SC': { pac: { price: 22.50, days: 3 }, sedex: { price: 36.00, days: 1 } },
    'PR': { pac: { price: 26.00, days: 4 }, sedex: { price: 41.00, days: 2 } },
    'RS': { pac: { price: 28.00, days: 5 }, sedex: { price: 43.50, days: 2 } },
    'SP': { pac: { price: 32.00, days: 6 }, sedex: { price: 50.50, days: 3 } },
    'RJ': { pac: { price: 35.00, days: 7 }, sedex: { price: 55.00, days: 3 } },
    'MG': { pac: { price: 33.50, days: 7 }, sedex: { price: 52.50, days: 3 } },
    'ES': { pac: { price: 35.50, days: 7 }, sedex: { price: 56.00, days: 3 } },
    'DF': { pac: { price: 38.00, days: 8 }, sedex: { price: 61.00, days: 4 } },
    'GO': { pac: { price: 38.50, days: 8 }, sedex: { price: 61.50, days: 4 } },
    'MT': { pac: { price: 41.00, days: 9 }, sedex: { price: 65.00, days: 5 } },
    'BA': { pac: { price: 39.50, days: 9 }, sedex: { price: 63.00, days: 5 } },
    'SE': { pac: { price: 41.50, days: 10 }, sedex: { price: 66.50, days: 5 } },
    'PE': { pac: { price: 42.50, days: 10 }, sedex: { price: 68.00, days: 6 } },
    'AL': { pac: { price: 43.00, days: 10 }, sedex: { price: 68.50, days: 6 } },
    'PB': { pac: { price: 43.50, days: 11 }, sedex: { price: 70.00, days: 6 } },
    'RN': { pac: { price: 44.50, days: 11 }, sedex: { price: 71.00, days: 6 } },
    'CE': { pac: { price: 45.50, days: 11 }, sedex: { price: 72.50, days: 6 } },
    'PI': { pac: { price: 46.00, days: 12 }, sedex: { price: 73.50, days: 7 } },
    'MA': { pac: { price: 46.50, days: 12 }, sedex: { price: 75.00, days: 7 } },
    'AC': { pac: { price: 51.00, days: 14 }, sedex: { price: 83.00, days: 8 } },
    'RO': { pac: { price: 49.50, days: 13 }, sedex: { price: 81.00, days: 8 } },
    'RR': { pac: { price: 52.50, days: 15 }, sedex: { price: 86.00, days: 9 } },
    'TO': { pac: { price: 47.50, days: 12 }, sedex: { price: 76.50, days: 7 } },
    'AP': { pac: { price: 53.00, days: 15 }, sedex: { price: 88.00, days: 9 } },
    'AM': { pac: { price: 51.50, days: 14 }, sedex: { price: 85.00, days: 8 } },
  },
};

export function getRegionFromCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');
  const prefix = cleanCEP.substring(0, 2);
  return CEP_REGIONS[prefix] || 'SP'; // Default to SP if not found
}

export function calculateShippingByTable(cep: string, size: 'P' | 'M' | 'G'): {
  services: Array<{
    id: number;
    name: string;
    price: number;
    deliveryTime: number;
    company: string;
  }>;
} {
  const region = getRegionFromCEP(cep);
  const rates = SHIPPING_TABLE[size][region];
  
  if (!rates) {
    // Fallback to SP prices if region not found
    const spRates = SHIPPING_TABLE[size]['SP'];
    return {
      services: [
        {
          id: 1,
          name: 'PAC',
          price: spRates.pac.price,
          deliveryTime: spRates.pac.days,
          company: 'Correios',
        },
        {
          id: 2,
          name: 'SEDEX',
          price: spRates.sedex.price,
          deliveryTime: spRates.sedex.days,
          company: 'Correios',
        },
      ],
    };
  }
  
  return {
    services: [
      {
        id: 1,
        name: 'PAC',
        price: rates.pac.price,
        deliveryTime: rates.pac.days,
        company: 'Correios',
      },
      {
        id: 2,
        name: 'SEDEX',
        price: rates.sedex.price,
        deliveryTime: rates.sedex.days,
        company: 'Correios',
      },
    ],
  };
}
