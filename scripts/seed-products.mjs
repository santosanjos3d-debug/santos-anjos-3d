/**
 * Script para migrar produtos do Catalog.tsx para o banco de dados
 * Execução: node scripts/seed-products.mjs
 */
import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error('DATABASE_URL não encontrada');
  process.exit(1);
}

// Dimensões padrão por tamanho (cm) e peso (gramas)
// Tamanho P (144mm), M (216mm), G (288mm)
const DIMENSIONS_BY_SIZE = {
  P: { widthCm: 8, heightCm: 15, lengthCm: 8, weightGrams: 150 },
  M: { widthCm: 12, heightCm: 22, lengthCm: 12, weightGrams: 350 },
  G: { widthCm: 16, heightCm: 30, lengthCm: 16, weightGrams: 700 },
};

const PRODUCTS = [
  {
    id: 1,
    name: 'Nossa Senhora de Lourdes',
    category: 'Nossa Senhora',
    image: '/images/sagrado-coracao-maria-edited.jpg',
    description: 'Estatueta de Nossa Senhora de Lourdes em PETG com filamento fundido, branca com detalhes delicados.',
    details: 'Impressão 3D de alta qualidade em PETG com filamento fundido. Cada detalhe foi cuidadosamente capturado para refletir a beleza e serenidade de Nossa Senhora de Lourdes, padroeira dos doentes.',
    price: '39.47',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39.47' },
      { size: 'M', label: 'Médio (216mm)', price: '54.70' },
      { size: 'G', label: 'Grande (288mm)', price: '91.60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sagrado-coracao-maria-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/sagrado-coracao-maria-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/sagrado-coracao-maria-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 1,
  },
  {
    id: 2,
    name: 'Sagrado Coração de Maria',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-edited.jpg',
    description: 'Representação do Sagrado Coração de Maria em PETG com filamento fundido, branca.',
    details: 'Impressão 3D em PETG com filamento fundido de alta qualidade. Captura a devoção e amor do Sagrado Coração de Maria com detalhes precisos e acabamento fino.',
    price: '54.47',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '54.47' },
      { size: 'M', label: 'Médio (216mm)', price: '97.93' },
      { size: 'G', label: 'Grande (288mm)', price: '137.73' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/nossa-senhora-lourdes-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/nossa-senhora-lourdes-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/nossa-senhora-lourdes-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 2,
  },
  {
    id: 3,
    name: 'Santa Gianna',
    category: 'Santas',
    image: '/images/santa-gianna-edited.jpg',
    description: 'Santa Gianna em representação serena e contemplativa.',
    details: 'Impressão 3D em PETG com filamento fundido de Santa Gianna, mãe e santa moderna. Peça inspiradora para famílias cristãs.',
    price: '66.00',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '66.00' },
      { size: 'M', label: 'Médio (216mm)', price: '119.17' },
      { size: 'G', label: 'Grande (288mm)', price: '215.87' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/santa-gianna-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/santa-gianna-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/santa-gianna-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 3,
  },
  {
    id: 4,
    name: 'Santa Hildegarda de Bingen',
    category: 'Santas',
    image: '/images/santa-hildegarda-bingen-edited.jpg',
    description: 'Santa Hildegarda de Bingen com palma e livro, símbolo de sabedoria.',
    details: 'Impressão 3D em PETG com filamento fundido. Santa Hildegarda é representada com seus símbolos característicos: a palma do martírio e o livro de seus escritos. Peça de grande significado espiritual.',
    price: '58.50',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '58.50' },
      { size: 'M', label: 'Médio (216mm)', price: '143.57' },
      { size: 'G', label: 'Grande (288mm)', price: '229.70' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/santa-hildegarda-bingen-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/santa-hildegarda-bingen-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/santa-hildegarda-verde-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 4,
  },
  {
    id: 5,
    name: 'São Francisco de Assis',
    category: 'Santos',
    image: '/images/sao-francisco-assis-edited.jpg',
    description: 'São Francisco de Assis em contemplação, com pombas e natureza.',
    details: 'Impressão 3D em PETG com filamento fundido. São Francisco é representado em sua característica pose contemplativa, cercado pelos símbolos da natureza que ele tão profundamente amava e respeitava.',
    price: '46.80',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '46.80' },
      { size: 'M', label: 'Médio (216mm)', price: '78.67' },
      { size: 'G', label: 'Grande (288mm)', price: '145.67' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-francisco-assis-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-francisco-assis-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/sao-francisco-assis-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 5,
  },
  {
    id: 6,
    name: 'São José com Menino Jesus',
    category: 'Santos',
    image: '/images/sao-jose-menino-jesus-real-edited.jpg',
    description: 'São José segurando o Menino Jesus com ternura e proteção.',
    details: 'Impressão 3D em PETG com filamento fundido. Esta representação captura o amor paternal de São José e sua devoção ao Menino Jesus. Peça perfeita para lares cristãos.',
    price: '52.50',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '52.50' },
      { size: 'M', label: 'Médio (216mm)', price: '100.60' },
      { size: 'G', label: 'Grande (288mm)', price: '160.27' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-jose-menino-jesus-real-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-jose-menino-jesus-real-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/sao-jose-menino-jesus-real-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 6,
  },
  {
    id: 7,
    name: 'Santo Antônio',
    category: 'Santos',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/sxaHLAFZvaIFKRwp.jpg',
    description: 'Santo Antônio com o Menino Jesus, santo protetor dos perdidos.',
    details: 'Impressão 3D em PETG com filamento fundido. Santo Antônio é representado com o Menino Jesus, símbolo de sua devoção e seu papel como protetor dos perdidos e das causas impossíveis.',
    price: '43.23',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '43.23' },
      { size: 'M', label: 'Médio (216mm)', price: '62.77' },
      { size: 'G', label: 'Grande (288mm)', price: '109.20' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/sxaHLAFZvaIFKRwp.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/sxaHLAFZvaIFKRwp.jpg' },
      { name: 'Verde', value: 'green', image: '/images/santo-antonio-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 7,
  },
  {
    id: 8,
    name: 'São Bento',
    category: 'Santos',
    image: '/images/sao-bento-edited.jpg',
    description: 'São Bento com sua cruz e livro, santo protetor contra o mal.',
    details: 'Impressão 3D em PETG com filamento fundido. São Bento é representado com seus símbolos característicos: a cruz de São Bento e o livro da Regra. Peça de grande poder espiritual.',
    price: '52.20',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '52.20' },
      { size: 'M', label: 'Médio (216mm)', price: '89.27' },
      { size: 'G', label: 'Grande (288mm)', price: '157.67' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-bento-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-bento-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/sao-bento-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 8,
  },
  {
    id: 9,
    name: 'São Josemaria',
    category: 'Santos',
    image: '/images/sao-josemaria-edited.jpg',
    description: 'São Josemaria Escrivá, fundador do Opus Dei.',
    details: 'Impressão 3D em PETG com filamento fundido. São Josemaria é representado em sua postura característica, refletindo sua missão de santificar o trabalho ordinário e a vida cotidiana.',
    price: '60.70',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '60.70' },
      { size: 'M', label: 'Médio (216mm)', price: '94.60' },
      { size: 'G', label: 'Grande (288mm)', price: '171.93' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-josemaria-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-josemaria-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/sao-josemaria-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 9,
  },
  {
    id: 10,
    name: 'São Miguel',
    category: 'Arcanjos',
    image: '/images/sao-miguel-medio-edited.jpg',
    description: 'São Miguel Arcanjo em postura triunfante sobre o demônio.',
    details: 'Impressão 3D em PETG com filamento fundido. São Miguel é representado como protetor e guerreiro espiritual, com asas majestosas e lança. Símbolo de vitória sobre o mal.',
    price: '59.03',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '59.03' },
      { size: 'M', label: 'Médio (216mm)', price: '103.27' },
      { size: 'G', label: 'Grande (288mm)', price: '213.43' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-miguel-medio-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-miguel-medio-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/sao-miguel-medio-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 10,
  },
  {
    id: 11,
    name: 'Nossa Senhora de Lourdes Grande - Branca',
    category: 'Nossa Senhora',
    image: '/images/sagrado-coracao-maria-edited.jpg',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor branca.',
    details: 'Impressão 3D em PETG com filamento fundido branca de Nossa Senhora de Lourdes em tamanho maior. Ideal para capelas e espaços maiores. Versão clássica em branco puro.',
    price: '91.60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39.47' },
      { size: 'M', label: 'Médio (216mm)', price: '54.70' },
      { size: 'G', label: 'Grande (288mm)', price: '91.60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sagrado-coracao-maria-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/nossa-senhora-lourdes-grande-marrom-real-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/nossa-senhora-lourdes-grande-verde-real-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.G,
    sortOrder: 11,
  },
  {
    id: 13,
    name: 'Nossa Senhora de Lourdes Grande - Marrom',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-grande-marrom-real-edited.jpg',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor marrom.',
    details: 'Impressão 3D em PETG com filamento fundido marrom de Nossa Senhora de Lourdes em tamanho maior. Versão em tom madeira quente, ideal para ambientes com decoração rústica.',
    price: '91.60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39.47' },
      { size: 'M', label: 'Médio (216mm)', price: '54.70' },
      { size: 'G', label: 'Grande (288mm)', price: '91.60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sagrado-coracao-maria-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/nossa-senhora-lourdes-grande-marrom-real-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/nossa-senhora-lourdes-grande-verde-real-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.G,
    sortOrder: 12,
  },
  {
    id: 14,
    name: 'Nossa Senhora de Lourdes Grande - Verde',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-grande-verde-real-edited.jpg',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor verde.',
    details: 'Impressão 3D em PETG com filamento fundido verde de Nossa Senhora de Lourdes em tamanho maior. Versão em tom verde esperança, perfeita para ambientes com decoração moderna.',
    price: '91.60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39.47' },
      { size: 'M', label: 'Médio (216mm)', price: '54.70' },
      { size: 'G', label: 'Grande (288mm)', price: '91.60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sagrado-coracao-maria-edited.jpg' },
      { name: 'Marrom', value: 'brown', image: '/images/nossa-senhora-lourdes-grande-marrom-real-edited.jpg' },
      { name: 'Verde', value: 'green', image: '/images/nossa-senhora-lourdes-grande-verde-real-edited.jpg' },
    ],
    ...DIMENSIONS_BY_SIZE.G,
    sortOrder: 13,
  },
  {
    id: 15,
    name: "Santa Teresa d'Ávila",
    category: 'Santas',
    image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/xftApfIlgSkQYrlR.png',
    description: "Santa Teresa d'Ávila em representação contemplativa, disponível em branco e marrom.",
    details: "Impressão 3D em PETG com filamento fundido de Santa Teresa d'Ávila, a grande mística e reformadora do Carmelo. Conhecida por sua profunda espiritualidade e seus escritos sobre a vida interior.",
    price: '83.60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '83.60' },
      { size: 'M', label: 'Médio (216mm)', price: '121.47' },
      { size: 'G', label: 'Grande (288mm)', price: '219.40' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/GlEQeVeuQeQuarJA.png' },
      { name: 'Marrom', value: 'brown', image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/xftApfIlgSkQYrlR.png' },
      { name: 'Verde', value: 'green', image: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/xftApfIlgSkQYrlR.png' },
    ],
    ...DIMENSIONS_BY_SIZE.P,
    sortOrder: 14,
  },
];

async function main() {
  // Parse DATABASE_URL: mysql://user:pass@host:port/dbname
  const url = new URL(DB_URL);
  const conn = await createConnection({
    host: url.hostname,
    port: parseInt(url.port || '3306'),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });

  console.log('Conectado ao banco. Inserindo produtos...');

  // Limpar produtos existentes
  await conn.execute('DELETE FROM products');
  console.log('Produtos existentes removidos.');

  for (const p of PRODUCTS) {
    await conn.execute(
      `INSERT INTO products (id, name, description, details, category, image, price, widthCm, heightCm, lengthCm, weightGrams, sizes, colors, active, sortOrder)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        p.id,
        p.name,
        p.description,
        p.details,
        p.category,
        p.image,
        p.price,
        p.widthCm,
        p.heightCm,
        p.lengthCm,
        p.weightGrams,
        JSON.stringify(p.sizes),
        JSON.stringify(p.colors),
        p.sortOrder,
      ]
    );
    console.log(`✓ ${p.name}`);
  }

  await conn.end();
  console.log(`\n✅ ${PRODUCTS.length} produtos migrados com sucesso!`);
}

main().catch(console.error);
