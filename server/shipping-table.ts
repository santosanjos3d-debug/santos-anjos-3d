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
    'SC': { pac: { price: 18.76, days: 7 }, sedex: { price: 30.25, days: 5 } },
    'PR': { pac: { price: 21.78, days: 8 }, sedex: { price: 34.49, days: 6 } },
    'RS': { pac: { price: 23.60, days: 9 }, sedex: { price: 36.30, days: 6 } },
    'SP': { pac: { price: 26.62, days: 10 }, sedex: { price: 42.35, days: 7 } },
    'RJ': { pac: { price: 29.04, days: 11 }, sedex: { price: 45.98, days: 7 } },
    'MG': { pac: { price: 27.83, days: 11 }, sedex: { price: 44.16, days: 7 } },
    'ES': { pac: { price: 29.65, days: 11 }, sedex: { price: 47.19, days: 7 } },
    'DF': { pac: { price: 31.46, days: 12 }, sedex: { price: 50.82, days: 8 } },
    'GO': { pac: { price: 32.06, days: 12 }, sedex: { price: 51.43, days: 8 } },
    'MT': { pac: { price: 33.88, days: 13 }, sedex: { price: 54.45, days: 9 } },
    'BA': { pac: { price: 32.67, days: 13 }, sedex: { price: 52.64, days: 9 } },
    'SE': { pac: { price: 34.49, days: 14 }, sedex: { price: 55.66, days: 9 } },
    'PE': { pac: { price: 35.09, days: 14 }, sedex: { price: 56.87, days: 10 } },
    'AL': { pac: { price: 35.70, days: 14 }, sedex: { price: 57.48, days: 10 } },
    'PB': { pac: { price: 36.30, days: 15 }, sedex: { price: 58.69, days: 10 } },
    'RN': { pac: { price: 36.91, days: 15 }, sedex: { price: 59.29, days: 10 } },
    'CE': { pac: { price: 37.51, days: 15 }, sedex: { price: 60.50, days: 10 } },
    'PI': { pac: { price: 38.12, days: 16 }, sedex: { price: 61.71, days: 11 } },
    'MA': { pac: { price: 38.72, days: 16 }, sedex: { price: 62.92, days: 11 } },
    'AC': { pac: { price: 42.35, days: 18 }, sedex: { price: 70.18, days: 12 } },
    'RO': { pac: { price: 41.14, days: 17 }, sedex: { price: 67.76, days: 12 } },
    'RR': { pac: { price: 43.56, days: 19 }, sedex: { price: 72.60, days: 13 } },
    'TO': { pac: { price: 39.33, days: 16 }, sedex: { price: 64.13, days: 11 } },
    'AP': { pac: { price: 44.16, days: 19 }, sedex: { price: 73.81, days: 13 } },
    'AM': { pac: { price: 42.95, days: 18 }, sedex: { price: 71.39, days: 12 } },
  },
  'M': { // 10x10x23cm, 150g
    'SC': { pac: { price: 22.39, days: 7 }, sedex: { price: 36.30, days: 5 } },
    'PR': { pac: { price: 26.02, days: 8 }, sedex: { price: 41.14, days: 6 } },
    'RS': { pac: { price: 27.83, days: 9 }, sedex: { price: 43.56, days: 6 } },
    'SP': { pac: { price: 32.06, days: 10 }, sedex: { price: 50.82, days: 7 } },
    'RJ': { pac: { price: 35.09, days: 11 }, sedex: { price: 55.05, days: 7 } },
    'MG': { pac: { price: 33.28, days: 11 }, sedex: { price: 52.64, days: 7 } },
    'ES': { pac: { price: 35.70, days: 11 }, sedex: { price: 56.27, days: 7 } },
    'DF': { pac: { price: 38.12, days: 12 }, sedex: { price: 61.11, days: 8 } },
    'GO': { pac: { price: 38.72, days: 12 }, sedex: { price: 61.71, days: 8 } },
    'MT': { pac: { price: 41.14, days: 13 }, sedex: { price: 65.34, days: 9 } },
    'BA': { pac: { price: 39.33, days: 13 }, sedex: { price: 62.92, days: 9 } },
    'SE': { pac: { price: 41.75, days: 14 }, sedex: { price: 66.55, days: 9 } },
    'PE': { pac: { price: 42.35, days: 14 }, sedex: { price: 68.37, days: 10 } },
    'AL': { pac: { price: 42.95, days: 14 }, sedex: { price: 68.97, days: 10 } },
    'PB': { pac: { price: 43.56, days: 15 }, sedex: { price: 70.18, days: 10 } },
    'RN': { pac: { price: 44.16, days: 15 }, sedex: { price: 70.78, days: 10 } },
    'CE': { pac: { price: 45.38, days: 15 }, sedex: { price: 72.60, days: 10 } },
    'PI': { pac: { price: 45.98, days: 16 }, sedex: { price: 73.81, days: 11 } },
    'MA': { pac: { price: 46.59, days: 16 }, sedex: { price: 75.02, days: 11 } },
    'AC': { pac: { price: 50.82, days: 18 }, sedex: { price: 83.49, days: 12 } },
    'RO': { pac: { price: 49.61, days: 17 }, sedex: { price: 81.07, days: 12 } },
    'RR': { pac: { price: 52.64, days: 19 }, sedex: { price: 87.12, days: 13 } },
    'TO': { pac: { price: 47.19, days: 16 }, sedex: { price: 76.83, days: 11 } },
    'AP': { pac: { price: 53.24, days: 19 }, sedex: { price: 88.33, days: 13 } },
    'AM': { pac: { price: 51.43, days: 18 }, sedex: { price: 85.31, days: 12 } },
  },
  'G': { // 15x15x30cm, 250g
    'SC': { pac: { price: 27.23, days: 7 }, sedex: { price: 43.56, days: 5 } },
    'PR': { pac: { price: 31.46, days: 8 }, sedex: { price: 49.61, days: 6 } },
    'RS': { pac: { price: 33.88, days: 9 }, sedex: { price: 52.64, days: 6 } },
    'SP': { pac: { price: 38.72, days: 10 }, sedex: { price: 61.11, days: 7 } },
    'RJ': { pac: { price: 42.35, days: 11 }, sedex: { price: 66.55, days: 7 } },
    'MG': { pac: { price: 40.54, days: 11 }, sedex: { price: 63.53, days: 7 } },
    'ES': { pac: { price: 42.95, days: 11 }, sedex: { price: 67.76, days: 7 } },
    'DF': { pac: { price: 45.98, days: 12 }, sedex: { price: 73.81, days: 8 } },
    'GO': { pac: { price: 46.59, days: 12 }, sedex: { price: 74.42, days: 8 } },
    'MT': { pac: { price: 49.61, days: 13 }, sedex: { price: 78.65, days: 9 } },
    'BA': { pac: { price: 47.80, days: 13 }, sedex: { price: 76.23, days: 9 } },
    'SE': { pac: { price: 50.22, days: 14 }, sedex: { price: 80.47, days: 9 } },
    'PE': { pac: { price: 51.43, days: 14 }, sedex: { price: 82.28, days: 10 } },
    'AL': { pac: { price: 52.03, days: 14 }, sedex: { price: 82.89, days: 10 } },
    'PB': { pac: { price: 52.64, days: 15 }, sedex: { price: 84.70, days: 10 } },
    'RN': { pac: { price: 53.85, days: 15 }, sedex: { price: 85.91, days: 10 } },
    'CE': { pac: { price: 55.05, days: 15 }, sedex: { price: 87.73, days: 10 } },
    'PI': { pac: { price: 55.66, days: 16 }, sedex: { price: 88.94, days: 11 } },
    'MA': { pac: { price: 56.27, days: 16 }, sedex: { price: 90.75, days: 11 } },
    'AC': { pac: { price: 61.71, days: 18 }, sedex: { price: 100.43, days: 12 } },
    'RO': { pac: { price: 59.90, days: 17 }, sedex: { price: 98.01, days: 12 } },
    'RR': { pac: { price: 63.53, days: 19 }, sedex: { price: 104.06, days: 13 } },
    'TO': { pac: { price: 57.48, days: 16 }, sedex: { price: 92.57, days: 11 } },
    'AP': { pac: { price: 64.13, days: 19 }, sedex: { price: 106.48, days: 13 } },
    'AM': { pac: { price: 62.32, days: 18 }, sedex: { price: 102.85, days: 12 } },
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
