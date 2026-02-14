/**
 * Catalog Component
 * Design: Minimalismo Sagrado - Grid responsivo de produtos com espaçamento generoso
 */

import { useState } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import Checkout from './Checkout';

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

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Nossa Senhora de Lourdes',
    category: 'Nossa Senhora',
    image: '/images/sagrado-coracao-maria-edited.png',
    description: 'Estatueta de Nossa Senhora de Lourdes em PETG com filamento fundido, branca com detalhes delicados.',
    details: 'Impressão 3D de alta qualidade em PETG com filamento fundido. Cada detalhe foi cuidadosamente capturado para refletir a beleza e serenidade de Nossa Senhora de Lourdes, padroeira dos doentes.',
    price: '39,47',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39,47' },
      { size: 'M', label: 'Médio (216mm)', price: '54,70' },
      { size: 'G', label: 'Grande (288mm)', price: '91,60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sagrado-coracao-maria-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/sagrado-coracao-maria-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/sagrado-coracao-maria-edited.png' },
    ],
  },
  {
    id: 2,
    name: 'Sagrado Coração de Maria',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-edited.png',
    description: 'Representação do Sagrado Coração de Maria em PETG com filamento fundido, branca.',
    details: 'Impressão 3D em PETG com filamento fundido de alta qualidade. Captura a devoção e amor do Sagrado Coração de Maria com detalhes precisos e acabamento fino.',
    price: '54,47',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '54,47' },
      { size: 'M', label: 'Médio (216mm)', price: '97,93' },
      { size: 'G', label: 'Grande (288mm)', price: '137,73' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/nossa-senhora-lourdes-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/nossa-senhora-lourdes-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/nossa-senhora-lourdes-edited.png' },
    ],
  },
  {
    id: 3,
    name: 'Santa Gianna',
    category: 'Santas',
    image: '/images/santa-gianna-edited.png',
    description: 'Santa Gianna em representação serena e contemplativa.',
    details: 'Impressão 3D em PETG com filamento fundido de Santa Gianna, mãe e santa moderna. Peça inspiradora para famílias cristãs.',
    price: '66,00',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '66,00' },
      { size: 'M', label: 'Médio (216mm)', price: '119,17' },
      { size: 'G', label: 'Grande (288mm)', price: '215,87' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/santa-gianna-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/santa-gianna-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/santa-gianna-edited.png' },
    ],
  },
  {
    id: 4,
    name: 'Santa Hildegarda de Bingen',
    category: 'Santas',
    image: '/images/santa-hildegarda-bingen-edited.png',
    description: 'Santa Hildegarda de Bingen com palma e livro, símbolo de sabedoria.',
    details: 'Impressão 3D em PETG com filamento fundido. Santa Hildegarda é representada com seus símbolos característicos: a palma do martírio e o livro de seus escritos. Peça de grande significado espiritual.',
    price: '58,50',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '58,50' },
      { size: 'M', label: 'Médio (216mm)', price: '143,57' },
      { size: 'G', label: 'Grande (288mm)', price: '229,70' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/santa-hildegarda-bingen-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/santa-hildegarda-bingen-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/santa-hildegarda-verde-edited.png' },
    ],
  },
  {
    id: 5,
    name: 'São Francisco de Assis',
    category: 'Santos',
    image: '/images/sao-francisco-assis-edited.png',
    description: 'São Francisco de Assis em contemplação, com pombas e natureza.',
    details: 'Impressão 3D em PETG com filamento fundido. São Francisco é representado em sua característica pose contemplativa, cercado pelos símbolos da natureza que ele tão profundamente amava e respeitava.',
    price: '46,80',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '46,80' },
      { size: 'M', label: 'Médio (216mm)', price: '78,67' },
      { size: 'G', label: 'Grande (288mm)', price: '145,67' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-francisco-assis-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-francisco-assis-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/sao-francisco-assis-edited.png' },
    ],
  },
  {
    id: 6,
    name: 'São José com Menino Jesus',
    category: 'Santos',
    image: '/images/sao-jose-menino-jesus-real-edited.png',
    description: 'São José segurando o Menino Jesus com ternura e proteção.',
    details: 'Impressão 3D em PETG com filamento fundido. Esta representação captura o amor paternal de São José e sua devoção ao Menino Jesus. Peça perfeita para lares cristãos.',
    price: '52,50',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '52,50' },
      { size: 'M', label: 'Médio (216mm)', price: '100,60' },
      { size: 'G', label: 'Grande (288mm)', price: '160,27' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-jose-menino-jesus-real-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-jose-menino-jesus-real-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/sao-jose-menino-jesus-real-edited.png' },
    ],
  },
  {
    id: 7,
    name: 'Santo Antônio',
    category: 'Santos',
    image: '/images/santo-antonio-edited.png',
    description: 'Santo Antônio com o Menino Jesus, santo protetor dos perdidos.',
    details: 'Impressão 3D em PETG com filamento fundido. Santo Antônio é representado com o Menino Jesus, símbolo de sua devoção e seu papel como protetor dos perdidos e das causas impossíveis.',
    price: '43,23',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '43,23' },
      { size: 'M', label: 'Médio (216mm)', price: '62,77' },
      { size: 'G', label: 'Grande (288mm)', price: '109,20' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/santo-antonio-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/santo-antonio-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/santo-antonio-edited.png' },
    ],
  },
  {
    id: 8,
    name: 'São Bento',
    category: 'Santos',
    image: '/images/sao-bento-edited.png',
    description: 'São Bento com sua cruz e livro, santo protetor contra o mal.',
    details: 'Impressão 3D em PETG com filamento fundido. São Bento é representado com seus símbolos característicos: a cruz de São Bento e o livro da Regra. Peça de grande poder espiritual.',
    price: '52,20',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '52,20' },
      { size: 'M', label: 'Médio (216mm)', price: '89,27' },
      { size: 'G', label: 'Grande (288mm)', price: '157,67' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-bento-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-bento-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/sao-bento-edited.png' },
    ],
  },
  {
    id: 9,
    name: 'São Josemaria',
    category: 'Santos',
    image: '/images/sao-josemaria-edited.png',
    description: 'São Josemaria Escrivá, fundador do Opus Dei.',
    details: 'Impressão 3D em PETG com filamento fundido. São Josemaria é representado em sua postura característica, refletindo sua missão de santificar o trabalho ordinário e a vida cotidiana.',
    price: '60,70',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '60,70' },
      { size: 'M', label: 'Médio (216mm)', price: '94,60' },
      { size: 'G', label: 'Grande (288mm)', price: '171,93' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-josemaria-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-josemaria-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/sao-josemaria-edited.png' },
    ],
  },
  {
    id: 10,
    name: 'São Miguel',
    category: 'Arcanjos',
    image: '/images/sao-miguel-medio-edited.png',
    description: 'São Miguel Arcanjo em postura triunfante sobre o demônio.',
    details: 'Impressão 3D em PETG com filamento fundido. São Miguel é representado como protetor e guerreiro espiritual, com asas majestosas e lança. Símbolo de vitória sobre o mal.',
    price: '59,03',
    sizes: [
      { size: 'P', label: 'Pequeno (94mm)', price: '59,03' },
      { size: 'M', label: 'Médio (188mm)', price: '103,27' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sao-miguel-medio-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/sao-miguel-medio-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/sao-miguel-medio-edited.png' },
    ],
  },
  {
    id: 11,
    name: 'Nossa Senhora de Lourdes Grande - Branca',
    category: 'Nossa Senhora',
    image: '/images/sagrado-coracao-maria-edited.png',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor branca.',
    details: 'Impressão 3D em PETG com filamento fundido branca de Nossa Senhora de Lourdes em tamanho maior. Ideal para capelas e espaços maiores. Versão clássica em branco puro.',
    price: '91,60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39,47' },
      { size: 'M', label: 'Médio (216mm)', price: '54,70' },
      { size: 'G', label: 'Grande (288mm)', price: '91,60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sagrado-coracao-maria-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/nossa-senhora-lourdes-grande-marrom-real-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/nossa-senhora-lourdes-grande-verde-real-edited.png' },
    ],
  },
  {
    id: 13,
    name: 'Nossa Senhora de Lourdes Grande - Marrom',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-grande-marrom-real-edited.png',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor marrom.',
    details: 'Impressão 3D em PETG com filamento fundido marrom de Nossa Senhora de Lourdes em tamanho maior. Versão em tom madeira quente, ideal para ambientes com decoração rústica.',
    price: '91,60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39,47' },
      { size: 'M', label: 'Médio (216mm)', price: '54,70' },
      { size: 'G', label: 'Grande (288mm)', price: '91,60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sagrado-coracao-maria-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/nossa-senhora-lourdes-grande-marrom-real-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/nossa-senhora-lourdes-grande-verde-real-edited.png' },
    ],
  },
  {
    id: 14,
    name: 'Nossa Senhora de Lourdes Grande - Verde',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-grande-verde-real-edited.png',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor verde.',
    details: 'Impressão 3D em PETG com filamento fundido verde de Nossa Senhora de Lourdes em tamanho maior. Versão em tom verde esperança, perfeita para ambientes com decoração moderna.',
    price: '91,60',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '39,47' },
      { size: 'M', label: 'Médio (216mm)', price: '54,70' },
      { size: 'G', label: 'Grande (288mm)', price: '91,60' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/sagrado-coracao-maria-edited.png' },
      { name: 'Marrom', value: 'brown', image: '/images/nossa-senhora-lourdes-grande-marrom-real-edited.png' },
      { name: 'Verde', value: 'green', image: '/images/nossa-senhora-lourdes-grande-verde-real-edited.png' },
    ],
  },
  {
    id: 15,
    name: 'Santa Teresa d\'Ávila',
    category: 'Santas',
    image: '/images/santa-teresa-avila-branca.png',
    description: 'Santa Teresa d\'Ávila em representação contemplativa e mística.',
    details: 'Santa Teresa d\'Ávila (1515-1582) foi uma mística espanhola, reformadora da Ordem Carmelita e Doutora da Igreja. Conhecida por seus escritos espirituais profundos e sua vida dedicada à oração contemplativa. Esta peça em impressão 3D captura a serenidade e a devoção da santa, ideal para ambientes de meditação e oração. Disponível em branco e marrom terracota.',
    price: '59,03',
    sizes: [
      { size: 'P', label: 'Pequeno (144mm)', price: '59,03' },
      { size: 'M', label: 'Médio (216mm)', price: '103,27' },
      { size: 'G', label: 'Grande (288mm)', price: '171,93' },
    ],
    colors: [
      { name: 'Branco', value: 'white', image: '/images/santa-teresa-avila-branca.png' },
      { name: 'Marrom', value: 'brown', image: '/images/santa-teresa-avila-marrom.png' },
    ],
  },
];

export default function Catalog() {
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
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
