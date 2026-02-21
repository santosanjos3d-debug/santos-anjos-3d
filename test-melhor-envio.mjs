import axios from 'axios';

const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
const ORIGIN_CEP = process.env.MELHOR_ENVIO_ORIGIN_CEP || '89227320';

console.log('🧪 Testando API Melhor Envio...\n');

// Test 1: Validate credentials
console.log('📋 Teste 1: Validando credenciais...');
try {
  const response = await axios.get(
    'https://api.melhorenvio.com.br/v2/me',
    {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Melhor Envio (giorgiotestoni@gmail.com)',
      },
    }
  );
  console.log('✅ Credenciais válidas!');
  console.log('   Nome:', response.data.firstname, response.data.lastname);
  console.log('   Email:', response.data.email);
  console.log('');
} catch (error) {
  console.log('❌ Erro ao validar credenciais:', error.response?.data || error.message);
  console.log('');
}

// Test 2: Calculate shipping
console.log('📦 Teste 2: Calculando frete (SP - Tamanho P)...');
try {
  const response = await axios.post(
    'https://api.melhorenvio.com.br/v2/shipment/calculate',
    {
      from: {
        postal_code: ORIGIN_CEP.replace('-', ''),
      },
      to: {
        postal_code: '01310100', // São Paulo
      },
      products: [
        {
          id: 1,
          width: 8,
          height: 8,
          length: 15,
          weight: 0.1, // 100g = 0.1kg
          quantity: 1,
          insurance_value: 0,
        },
      ],
    },
    {
      headers: {
        'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Melhor Envio (giorgiotestoni@gmail.com)',
      },
    }
  );
  
  console.log('✅ Cálculo realizado com sucesso!');
  console.log(`   ${response.data.length} serviços encontrados:\n`);
  
  response.data.forEach(service => {
    console.log(`   📮 ${service.name} (${service.company.name})`);
    console.log(`      Preço: R$ ${service.price}`);
    console.log(`      Prazo: ${service.delivery_time} dias úteis`);
    console.log('');
  });
} catch (error) {
  console.log('❌ Erro ao calcular frete:', error.response?.data || error.message);
  console.log('');
}

console.log('🏁 Testes concluídos!');
