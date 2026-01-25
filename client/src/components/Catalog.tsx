/*
 * Catalog Component
 * Design: Minimalismo Sagrado - Grid responsivo de produtos com espaçamento generoso
 */

import { useState } from 'react';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import Checkout from './Checkout';

interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  details: string;
  price: string;
  sizes?: string[];
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Nossa Senhora de Lourdes',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-pequena-nobg.png',
    description: 'Estatueta de Nossa Senhora de Lourdes em resina branca com detalhes delicados.',
    details: 'Impressão 3D de alta qualidade em resina branca. Cada detalhe foi cuidadosamente capturado para refletir a beleza e serenidade de Nossa Senhora de Lourdes, padroeira dos doentes.',
    price: '29.33',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 2,
    name: 'Sagrado Coração de Maria',
    category: 'Nossa Senhora',
    image: '/images/sagrado-coracao-maria-nobg.png',
    description: 'Representação do Sagrado Coração de Maria em resina branca.',
    details: 'Impressão 3D em resina branca de alta qualidade. Captura a devoção e amor do Sagrado Coração de Maria com detalhes precisos e acabamento fino.',
    price: '40.85',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 3,
    name: 'Santa Hildegarda de Bingen',
    category: 'Santas',
    image: '/images/santa-hildegarda-bingen-nobg.png',
    description: 'Santa Hildegarda de Bingen com palma e livro, símbolo de sabedoria.',
    details: 'Impressão 3D em resina branca. Santa Hildegarda é representada com seus símbolos característicos: a palma do martírio e o livro de seus escritos. Peça de grande significado espiritual.',
    price: '40.58',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 4,
    name: 'São Francisco de Assis',
    category: 'Santos',
    image: '/images/sao-francisco-assis-nobg.png',
    description: 'Santo Francisco de Assis em pose contemplativa com livro.',
    details: 'Representação tocante de São Francisco em sua postura de contemplação. Impressão em resina branca com detalhes que capturam a serenidade e espiritualidade do santo.',
    price: '35.10',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 5,
    name: 'São José com Menino Jesus',
    category: 'Santos',
    image: '/images/sao-jose-menino-jesus-nobg.png',
    description: 'São José segurando o Menino Jesus com ternura e proteção.',
    details: 'Representação tocante da relação entre São José e Jesus. Impressão em resina branca com detalhes delicados que refletem o amor e a proteção de São José.',
    price: '39.38',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 6,
    name: 'Santo Antônio',
    category: 'Santos',
    image: '/images/santo-antonio-nobg.png',
    description: 'Santo Antônio em coluna alta, representação majestosa e contemplativa.',
    details: 'Impressão 3D em resina branca de Santo Antônio. Representação clássica do santo em sua forma contemplativa. Ideal para nichos e altares que exigem maior altura e presença.',
    price: '32.43',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 7,
    name: 'São Bento',
    category: 'Santos',
    image: '/images/placeholder.png',
    description: 'São Bento em representação clássica com cruz e livro.',
    details: 'Impressão 3D em resina branca de São Bento, padroeiro dos beneditinos. Peça com grande valor espiritual e histórico.',
    price: '39.15',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 8,
    name: 'São Miguel Pequeno',
    category: 'Santos',
    image: '/images/placeholder.png',
    description: 'São Miguel Arcanjo em tamanho pequeno com espada e escudo.',
    details: 'Impressão 3D em resina branca de São Miguel Arcanjo. Representação do protetor contra o mal, ideal para proteção espiritual.',
    price: '44.28',
    sizes: ['Pequeno (170mm)'],
  },
  {
    id: 9,
    name: 'São Miguel Médio',
    category: 'Santos',
    image: '/images/placeholder.png',
    description: 'São Miguel Arcanjo em tamanho médio com espada e escudo.',
    details: 'Impressão 3D em resina branca de São Miguel Arcanjo em tamanho maior. Mais presença e impacto visual para altares e nichos.',
    price: '77.45',
    sizes: ['Médio (309mm)'],
  },
  {
    id: 10,
    name: 'São Carlo Acutis',
    category: 'Santos',
    image: '/images/placeholder.png',
    description: 'São Carlo Acutis, o beato programador, em representação moderna.',
    details: 'Impressão 3D em resina branca de São Carlo Acutis, padroeiro dos programadores. Peça única que une fé e tecnologia.',
    price: '35.28',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 11,
    name: 'São Josemaria',
    category: 'Santos',
    image: '/images/placeholder.png',
    description: 'São Josemaria Escrivá em representação contemplativa.',
    details: 'Impressão 3D em resina branca de São Josemaria Escrivá, fundador do Opus Dei. Peça para devoção e inspiração espiritual.',
    price: '29.13',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 12,
    name: 'Nossa Senhora de Lourdes Grande - Branca',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-grande-branca-edited.png',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor branca.',
    details: 'Impressão 3D em resina branca de Nossa Senhora de Lourdes em tamanho maior. Ideal para capelas e espaços maiores. Versão clássica em branco puro.',
    price: '73.13',
    sizes: ['Grande (288mm)'],
  },
  {
    id: 14,
    name: 'Nossa Senhora de Lourdes Grande - Marrom',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-grande-marrom-edited.png',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor marrom.',
    details: 'Impressão 3D em resina marrom de Nossa Senhora de Lourdes em tamanho maior. Versão em tom madeira quente, ideal para ambientes com decoração rústica.',
    price: '73.13',
    sizes: ['Grande (288mm)'],
  },
  {
    id: 15,
    name: 'Nossa Senhora de Lourdes Grande - Verde',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-grande-verde-edited.png',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor verde.',
    details: 'Impressão 3D em resina verde de Nossa Senhora de Lourdes em tamanho maior. Versão em tom verde natural, trazendo frescor e conexão com a natureza.',
    price: '73.13',
    sizes: ['Grande (288mm)'],
  },
  {
    id: 13,
    name: 'Santa Gianna',
    category: 'Santas',
    image: '/images/placeholder.png',
    description: 'Santa Gianna em representação serena e contemplativa.',
    details: 'Impressão 3D em resina branca de Santa Gianna, mãe e santa moderna. Peça inspiradora para famílias cristãs.',
    price: '43.18',
    sizes: ['Pequeno (144mm)'],
  },
];

export default function Catalog() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [cartItem, setCartItem] = useState<{ product: Product; quantity: number } | null>(null);

  const handleBuyNow = (product: Product) => {
    setCartItem({ product, quantity: 1 });
    setIsCheckoutOpen(true);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">Catálogo de Santos</h2>
          <p className="text-lg text-muted-foreground">
            Cada peça é uma obra de arte, cuidadosamente impressa em 3D com atenção aos detalhes e qualidade superior.
          </p>
        </div>

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
              onBuyClick={() => handleBuyNow(product)}
              onDetailsClick={() => handleViewDetails(product)}
            />
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal isOpen={true} product={selectedProduct} onClose={handleCloseModal} />
      )}

      {isCheckoutOpen && cartItem && (
        <Checkout
          productId={cartItem.product.id}
          productName={cartItem.product.name}
          productPrice={cartItem.product.price}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}
    </section>
  );
}
