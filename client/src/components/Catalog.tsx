/**
 * Catalog Component
 * Design: Minimalismo Sagrado - Grid responsivo de produtos com espaçamento generoso
 */

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';

interface ProductColor {
  name: string;
  value: string;
  image: string;
}

interface ProductSize {
  size: string;
  label: string;
  price: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  details: string;
  price: string;
  sizes?: ProductSize[];
  colors?: ProductColor[];
}

// Produtos agora carregados dinamicamente do banco de dados
const PRODUCTS_FALLBACK: Product[] = [
  {
    id: 1,
    name: 'Nossa Senhora de Lourdes',
    category: 'Nossa Senhora',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-edited-2imolgLJ5gPEyb5PIhN48r01DTeKor.jpg',
    description: 'Estatueta de Nossa Senhora de Lourdes em PETG com filamento fundido, branca com detalhes delicados.',
    details: 'Impressão 3D de alta qualidade em PETG com filamento fundido. Cada detalhe foi cuidadosamente capturado para refletir a beleza e serenidade de Nossa Senhora de Lourdes, padroeira dos doentes.',
    price: '39,47',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39,47' },
      { size: 'M', label: 'Médio (216mm)', price: '54,70' },
      { size: 'G', label: 'Grande (288mm)', price: '91,60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-edited-2imolgLJ5gPEyb5PIhN48r01DTeKor.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-edited-2imolgLJ5gPEyb5PIhN48r01DTeKor.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-edited-2imolgLJ5gPEyb5PIhN48r01DTeKor.jpg' },
    ],
  },
  {
    id: 2,
    name: 'Sagrado Coração de Maria',
    category: 'Nossa Senhora',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-edited-ghcaBoSv8EteE0AH6034FqMu1tO0Bg.jpg',
    description: 'Representação do Sagrado Coração de Maria em PETG com filamento fundido, branca.',
    details: 'Impressão 3D em PETG com filamento fundido de alta qualidade. Captura a devoção e amor do Sagrado Coração de Maria com detalhes precisos e acabamento fino.',
    price: '54,47',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '54,47' },
      { size: 'M', label: 'Médio (216mm)', price: '97,93' },
      { size: 'G', label: 'Grande (288mm)', price: '137,73' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-edited-ghcaBoSv8EteE0AH6034FqMu1tO0Bg.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-edited-ghcaBoSv8EteE0AH6034FqMu1tO0Bg.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-edited-ghcaBoSv8EteE0AH6034FqMu1tO0Bg.jpg' },
    ],
  },
  {
    id: 3,
    name: 'Santa Gianna',
    category: 'Santas',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-gianna-edited-vTuEY3i5gBD24jyQASURCTD6hPHFBo.jpg',
    description: 'Santa Gianna em representação serena e contemplativa.',
    details: 'Impressão 3D em PETG com filamento fundido de Santa Gianna, mãe e santa moderna. Peça inspiradora para famílias cristãs.',
    price: '66,00',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '66,00' },
      { size: 'M', label: 'Médio (216mm)', price: '119,17' },
      { size: 'G', label: 'Grande (288mm)', price: '215,87' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-gianna-edited-vTuEY3i5gBD24jyQASURCTD6hPHFBo.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-gianna-edited-vTuEY3i5gBD24jyQASURCTD6hPHFBo.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-gianna-edited-vTuEY3i5gBD24jyQASURCTD6hPHFBo.jpg' },
    ],
  },
  {
    id: 4,
    name: 'Santa Hildegarda de Bingen',
    category: 'Santas',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-hildegarda-bingen-edited-mfDRnJYqIkphH8udQ0MycpHILbfBmp.jpg',
    description: 'Santa Hildegarda de Bingen com palma e livro, símbolo de sabedoria.',
    details: 'Impressão 3D em PETG com filamento fundido. Santa Hildegarda é representada com seus símbolos característicos: a palma do martírio e o livro de seus escritos. Peça de grande significado espiritual.',
    price: '58,50',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '58,50' },
      { size: 'M', label: 'Médio (216mm)', price: '143,57' },
      { size: 'G', label: 'Grande (288mm)', price: '229,70' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-hildegarda-bingen-edited-mfDRnJYqIkphH8udQ0MycpHILbfBmp.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-hildegarda-bingen-edited-mfDRnJYqIkphH8udQ0MycpHILbfBmp.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-hildegarda-verde-edited-tvccoanBeEGefPeZ9h4krSUz2ujYTO.jpg' },
    ],
  },
  {
    id: 5,
    name: 'São Francisco de Assis',
    category: 'Santos',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-francisco-assis-edited-JEXREXGgBosVejVFyX3WdJC1YwxzNv.jpg',
    description: 'São Francisco de Assis em contemplação, com pombas e natureza.',
    details: 'Impressão 3D em PETG com filamento fundido. São Francisco é representado em sua característica pose contemplativa, cercado pelos símbolos da natureza que ele tão profundamente amava e respeitava.',
    price: '46,80',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '46,80' },
      { size: 'M', label: 'Médio (216mm)', price: '78,67' },
      { size: 'G', label: 'Grande (288mm)', price: '145,67' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-francisco-assis-edited-JEXREXGgBosVejVFyX3WdJC1YwxzNv.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-francisco-assis-edited-JEXREXGgBosVejVFyX3WdJC1YwxzNv.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-francisco-assis-edited-JEXREXGgBosVejVFyX3WdJC1YwxzNv.jpg' },
    ],
  },
  {
    id: 6,
    name: 'São José com Menino Jesus',
    category: 'Santos',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-menino-jesus-real-edited-sNrWOPIWUJmFet0PGLVwaXen6uMK6q.jpg',
    description: 'São José segurando o Menino Jesus com ternura e proteção.',
    details: 'Impressão 3D em PETG com filamento fundido. Esta representação captura o amor paternal de São José e sua devoção ao Menino Jesus. Peça perfeita para lares cristãos.',
    price: '52,50',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '52,50' },
      { size: 'M', label: 'Médio (216mm)', price: '100,60' },
      { size: 'G', label: 'Grande (288mm)', price: '160,27' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-menino-jesus-real-edited-sNrWOPIWUJmFet0PGLVwaXen6uMK6q.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-menino-jesus-real-edited-sNrWOPIWUJmFet0PGLVwaXen6uMK6q.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-menino-jesus-real-edited-sNrWOPIWUJmFet0PGLVwaXen6uMK6q.jpg' },
    ],
  },
  {
    id: 7,
    name: 'Santo Antônio',
    category: 'Santos',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/sxaHLAFZvaIFKRwp-PRwXDDwTQ47u7zb5ToYTdI5k2NWGd6.jpg',
    description: 'Santo Antônio com o Menino Jesus, santo protetor dos perdidos.',
    details: 'Impressão 3D em PETG com filamento fundido. Santo Antônio é representado com o Menino Jesus, símbolo de sua devoção e seu papel como protetor dos perdidos e das causas impossíveis.',
    price: '43,23',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '43,23' },
      { size: 'M', label: 'Médio (216mm)', price: '62,77' },
      { size: 'G', label: 'Grande (288mm)', price: '109,20' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/sxaHLAFZvaIFKRwp-PRwXDDwTQ47u7zb5ToYTdI5k2NWGd6.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/sxaHLAFZvaIFKRwp-PRwXDDwTQ47u7zb5ToYTdI5k2NWGd6.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santo-antonio-edited-NxCDkiF8oyBe4giS3xCn5LzfmmpYxh.jpg' },
    ],
  },
  {
    id: 8,
    name: 'São Bento',
    category: 'Santos',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-bento-edited-njSVGPUCr5Y09k3E2fa5PCwOG6AEGR.jpg',
    description: 'São Bento com sua cruz e livro, santo protetor contra o mal.',
    details: 'Impressão 3D em PETG com filamento fundido. São Bento é representado com seus símbolos característicos: a cruz de São Bento e o livro da Regra. Peça de grande poder espiritual.',
    price: '52,20',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '52,20' },
      { size: 'M', label: 'Médio (216mm)', price: '89,27' },
      { size: 'G', label: 'Grande (288mm)', price: '157,67' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-bento-edited-njSVGPUCr5Y09k3E2fa5PCwOG6AEGR.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-bento-edited-njSVGPUCr5Y09k3E2fa5PCwOG6AEGR.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-bento-edited-njSVGPUCr5Y09k3E2fa5PCwOG6AEGR.jpg' },
    ],
  },
  {
    id: 9,
    name: 'São Josemaria',
    category: 'Santos',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-josemaria-edited-HKU0rNn4d3Nk0W3xA8bxHeik6tJduB.jpg',
    description: 'São Josemaria Escrivá, fundador do Opus Dei.',
    details: 'Impressão 3D em PETG com filamento fundido. São Josemaria é representado em sua postura característica, refletindo sua missão de santificar o trabalho ordinário e a vida cotidiana.',
    price: '60,70',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '60,70' },
      { size: 'M', label: 'Médio (216mm)', price: '94,60' },
      { size: 'G', label: 'Grande (288mm)', price: '171,93' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-josemaria-edited-HKU0rNn4d3Nk0W3xA8bxHeik6tJduB.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-josemaria-edited-HKU0rNn4d3Nk0W3xA8bxHeik6tJduB.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-josemaria-edited-HKU0rNn4d3Nk0W3xA8bxHeik6tJduB.jpg' },
    ],
  },
  {
    id: 10,
    name: 'São Miguel',
    category: 'Arcanjos',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-miguel-medio-edited-O9rcaTsIxXqRV79xcvpE3KLAK50jRp.jpg',
    description: 'São Miguel Arcanjo em postura triunfante sobre o demônio.',
    details: 'Impressão 3D em PETG com filamento fundido. São Miguel é representado como protetor e guerreiro espiritual, com asas majestosas e lança. Símbolo de vitória sobre o mal.',
    price: '59,03',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '59,03' },
      { size: 'M', label: 'Médio (216mm)', price: '103,27' },
      { size: 'G', label: 'Grande (288mm)', price: '213,43' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-miguel-medio-edited-O9rcaTsIxXqRV79xcvpE3KLAK50jRp.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-miguel-medio-edited-O9rcaTsIxXqRV79xcvpE3KLAK50jRp.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-miguel-medio-edited-O9rcaTsIxXqRV79xcvpE3KLAK50jRp.jpg' },
    ],
  },
  {
    id: 11,
    name: 'Nossa Senhora de Lourdes Grande - Branca',
    category: 'Nossa Senhora',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-edited-2imolgLJ5gPEyb5PIhN48r01DTeKor.jpg',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor branca.',
    details: 'Impressão 3D em PETG com filamento fundido branca de Nossa Senhora de Lourdes em tamanho maior. Ideal para capelas e espaços maiores. Versão clássica em branco puro.',
    price: '91,60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39,47' },
      { size: 'M', label: 'Médio (216mm)', price: '54,70' },
      { size: 'G', label: 'Grande (288mm)', price: '91,60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-edited-2imolgLJ5gPEyb5PIhN48r01DTeKor.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-marrom-real-edited-Ehn3NKJNYV6Skl8N0Fhy6nobiibcRc.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-verde-real-edited-0Ik5hW6IDbIMa34CLbnEMHJs0INebQ.jpg' },
    ],
  },
  {
    id: 13,
    name: 'Nossa Senhora de Lourdes Grande - Marrom',
    category: 'Nossa Senhora',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-marrom-real-edited-Ehn3NKJNYV6Skl8N0Fhy6nobiibcRc.jpg',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor marrom.',
    details: 'Impressão 3D em PETG com filamento fundido marrom de Nossa Senhora de Lourdes em tamanho maior. Versão em tom madeira quente, ideal para ambientes com decoração rústica.',
    price: '91,60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39,47' },
      { size: 'M', label: 'Médio (216mm)', price: '54,70' },
      { size: 'G', label: 'Grande (288mm)', price: '91,60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-edited-2imolgLJ5gPEyb5PIhN48r01DTeKor.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-marrom-real-edited-Ehn3NKJNYV6Skl8N0Fhy6nobiibcRc.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-verde-real-edited-0Ik5hW6IDbIMa34CLbnEMHJs0INebQ.jpg' },
    ],
  },
  {
    id: 14,
    name: 'Nossa Senhora de Lourdes Grande - Verde',
    category: 'Nossa Senhora',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-verde-real-edited-0Ik5hW6IDbIMa34CLbnEMHJs0INebQ.jpg',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor verde.',
    details: 'Impressão 3D em PETG com filamento fundido verde de Nossa Senhora de Lourdes em tamanho maior. Versão em tom verde esperança, perfeita para ambientes com decoração moderna.',
    price: '91,60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39,47' },
      { size: 'M', label: 'Médio (216mm)', price: '54,70' },
      { size: 'G', label: 'Grande (288mm)', price: '91,60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-edited-2imolgLJ5gPEyb5PIhN48r01DTeKor.jpg' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-marrom-real-edited-Ehn3NKJNYV6Skl8N0Fhy6nobiibcRc.jpg' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-verde-real-edited-0Ik5hW6IDbIMa34CLbnEMHJs0INebQ.jpg' },
    ],
  },
  {
    id: 15,
    name: 'Santa Teresa d\'Ávila',
    category: 'Santas',
    image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/xftApfIlgSkQYrlR-5OwMiD9pbDj3V3fZoXO1CBzSwr5HbU.webp',
    description: 'Santa Teresa d\'Ávila em representação contemplativa, disponível em branco e marrom.',
    details: 'Impressão 3D em PETG com filamento fundido de Santa Teresa d\'Ávila, a grande mística e reformadora do Carmelo. Conhecida por sua profunda espiritualidade e seus escritos sobre a vida interior. Peça inspiradora para aqueles que buscam aprofundar sua vida de oração e contemplação.',
    price: '83,60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '83,60' },
      { size: 'M', label: 'Médio (216mm)', price: '121,47' },
      { size: 'G', label: 'Grande (288mm)', price: '219,40' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/GlEQeVeuQeQuarJA-ymTmoXq9ZAAXGhVnj15Kkj3iznA6Sx.webp' },
      { name: 'Marrom', value: 'brown', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/xftApfIlgSkQYrlR-5OwMiD9pbDj3V3fZoXO1CBzSwr5HbU.webp' },
      { name: 'Verde', value: 'green', image: 'https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/xftApfIlgSkQYrlR-5OwMiD9pbDj3V3fZoXO1CBzSwr5HbU.webp' },
    ],
  },
];

export default function Catalog() {
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [dbProducts, setDbProducts] = useState<Product[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setDbProducts(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category || '',
            image: p.image || '',
            description: p.description || '',
            details: p.details || '',
            price: p.price || '0',
            sizes: Array.isArray(p.sizes) ? p.sizes : (p.sizes ? JSON.parse(p.sizes) : undefined),
            colors: Array.isArray(p.colors) ? p.colors : (p.colors ? JSON.parse(p.colors) : undefined),
          })));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const products: Product[] = dbProducts && dbProducts.length > 0
    ? dbProducts
    : PRODUCTS_FALLBACK;

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(undefined), 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-accent/5 to-background py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Catálogo de Produtos</h1>
          <p className="text-lg text-foreground/70">Cada peça é uma obra de arte cuidadosamente impressa em 3D</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {isLoading && (
          <div className="text-center py-12 text-foreground/50">Carregando produtos...</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.category}
              image={product.image}
              description={product.description}
              price={product.price}
              onDetailsClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseModal}
      />
    </div>
  );
}
