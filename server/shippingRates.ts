/**
 * Tabela de frete customizada por estado
 * Você pode atualizar esses valores conforme necessário
 */

export interface ShippingRate {
  state: string;
  stateCode: string;
  small: number; // 144mm - 100g
  medium: number; // 216mm - 150g
  large: number; // 288mm - 250g
}

export const shippingRates: ShippingRate[] = [
  // Sul
  { state: 'Santa Catarina', stateCode: 'SC', small: 25, medium: 35, large: 50 },
  { state: 'Paraná', stateCode: 'PR', small: 28, medium: 38, large: 55 },
  { state: 'Rio Grande do Sul', stateCode: 'RS', small: 30, medium: 40, large: 60 },

  // Sudeste
  { state: 'São Paulo', stateCode: 'SP', small: 35, medium: 45, large: 65 },
  { state: 'Rio de Janeiro', stateCode: 'RJ', small: 35, medium: 45, large: 65 },
  { state: 'Minas Gerais', stateCode: 'MG', small: 32, medium: 42, large: 60 },
  { state: 'Espírito Santo', stateCode: 'ES', small: 32, medium: 42, large: 60 },

  // Nordeste
  { state: 'Bahia', stateCode: 'BA', small: 40, medium: 50, large: 70 },
  { state: 'Pernambuco', stateCode: 'PE', small: 42, medium: 52, large: 75 },
  { state: 'Ceará', stateCode: 'CE', small: 42, medium: 52, large: 75 },
  { state: 'Maranhão', stateCode: 'MA', small: 45, medium: 55, large: 80 },
  { state: 'Piauí', stateCode: 'PI', small: 45, medium: 55, large: 80 },
  { state: 'Rio Grande do Norte', stateCode: 'RN', small: 42, medium: 52, large: 75 },
  { state: 'Paraíba', stateCode: 'PB', small: 42, medium: 52, large: 75 },
  { state: 'Alagoas', stateCode: 'AL', small: 42, medium: 52, large: 75 },
  { state: 'Sergipe', stateCode: 'SE', small: 42, medium: 52, large: 75 },

  // Centro-Oeste
  { state: 'Goiás', stateCode: 'GO', small: 38, medium: 48, large: 68 },
  { state: 'Distrito Federal', stateCode: 'DF', small: 38, medium: 48, large: 68 },
  { state: 'Mato Grosso do Sul', stateCode: 'MS', small: 40, medium: 50, large: 70 },
  { state: 'Mato Grosso', stateCode: 'MT', small: 42, medium: 52, large: 75 },

  // Norte
  { state: 'Amazonas', stateCode: 'AM', small: 55, medium: 70, large: 100 },
  { state: 'Pará', stateCode: 'PA', small: 55, medium: 70, large: 100 },
  { state: 'Rondônia', stateCode: 'RO', small: 50, medium: 65, large: 90 },
  { state: 'Acre', stateCode: 'AC', small: 60, medium: 75, large: 110 },
  { state: 'Roraima', stateCode: 'RR', small: 65, medium: 80, large: 120 },
  { state: 'Amapá', stateCode: 'AP', small: 60, medium: 75, large: 110 },
  { state: 'Tocantins', stateCode: 'TO', small: 48, medium: 60, large: 85 },
];

/**
 * Mapa de CEP para estado (primeiros 2 dígitos do CEP)
 * Você pode expandir isso conforme necessário
 */
export const cepToState: Record<string, string> = {
  '01': 'SP', // São Paulo
  '02': 'SP',
  '03': 'SP',
  '04': 'SP',
  '05': 'SP',
  '06': 'SP',
  '07': 'SP',
  '08': 'SP',
  '09': 'SP',
  '10': 'RJ', // Rio de Janeiro
  '11': 'RJ',
  '12': 'RJ',
  '13': 'RJ',
  '14': 'RJ',
  '15': 'RJ',
  '16': 'RJ',
  '17': 'RJ',
  '18': 'RJ',
  '19': 'RJ',
  '20': 'MG', // Minas Gerais
  '21': 'MG',
  '22': 'MG',
  '23': 'MG',
  '24': 'MG',
  '25': 'MG',
  '26': 'MG',
  '27': 'MG',
  '28': 'ES', // Espírito Santo
  '29': 'ES',
  '30': 'BA', // Bahia
  '31': 'BA',
  '32': 'BA',
  '33': 'BA',
  '34': 'BA',
  '35': 'BA',
  '36': 'BA',
  '37': 'BA',
  '38': 'BA',
  '39': 'BA',
  '40': 'PE', // Pernambuco
  '41': 'PE',
  '42': 'PE',
  '43': 'PE',
  '44': 'PE',
  '45': 'PE',
  '46': 'PE',
  '47': 'PE',
  '48': 'PE',
  '49': 'PE',
  '50': 'AL', // Alagoas
  '51': 'AL',
  '52': 'SE', // Sergipe
  '53': 'SE',
  '54': 'PE', // Pernambuco (continuação)
  '55': 'PE',
  '56': 'AL', // Alagoas (continuação)
  '57': 'AL',
  '58': 'PB', // Paraíba
  '59': 'PB',
  '60': 'CE', // Ceará
  '61': 'CE',
  '62': 'CE',
  '63': 'CE',
  '64': 'RN', // Rio Grande do Norte
  '65': 'RN',
  '66': 'PI', // Piauí
  '67': 'PI',
  '68': 'MA', // Maranhão
  '69': 'MA',
  '70': 'DF', // Distrito Federal
  '71': 'DF',
  '72': 'GO', // Goiás
  '73': 'GO',
  '74': 'GO',
  '75': 'GO',
  '76': 'GO',
  '77': 'GO',
  '78': 'MT', // Mato Grosso
  '79': 'MT',
  '80': 'MS', // Mato Grosso do Sul
  '81': 'MS',
  '82': 'MS',
  '83': 'MS',
  '84': 'MS',
  '85': 'MS',
  '86': 'PR', // Paraná
  '87': 'PR',
  '88': 'SC', // Santa Catarina
  '89': 'SC',
  '90': 'RS', // Rio Grande do Sul
  '91': 'RS',
  '92': 'RS',
  '93': 'RS',
  '94': 'RS',
  '95': 'RS',
  '96': 'RS',
  '97': 'RS',
  '98': 'RS',
  '99': 'RS',
};

export function getShippingRate(cep: string, size: 'small' | 'medium' | 'large'): number | null {
  // Extract first 2 digits of CEP
  const cepPrefix = cep.substring(0, 2);
  const stateCode = cepToState[cepPrefix];

  if (!stateCode) {
    return null;
  }

  const rate = shippingRates.find(r => r.stateCode === stateCode);
  if (!rate) {
    return null;
  }

  return rate[size];
}
