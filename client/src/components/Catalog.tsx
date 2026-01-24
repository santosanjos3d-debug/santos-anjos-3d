/**
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
    image: '/images/sagrado-coracao-maria-edited.png',
    description: 'Estatueta de Nossa Senhora de Lourdes em resina branca com detalhes delicados.',
    details: 'Impressão 3D de alta qualidade em resina branca. Cada detalhe foi cuidadosamente capturado para refletir a beleza e serenidade de Nossa Senhora de Lourdes, padroeira dos doentes.',
    price: '150.00',
    sizes: ['Pequeno (8x16cm, 100g)', 'Médio (10x30cm, 200g)'],
  },
  {
    id: 2,
    name: 'Sagrado Coração de Maria',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-edited.png',
    description: 'Representação do Sagrado Coração de Maria em resina branca.',
    details: 'Impressão 3D em resina branca de alta qualidade. Captura a devoção e amor do Sagrado Coração de Maria com detalhes precisos e acabamento fino.',
    price: '165.00',
    sizes: ['Pequeno (8x16cm, 100g)', 'Médio (10x30cm, 200g)'],
  },
  {
    id: 3,
    name: 'Santa Hildegarda de Bingen',
    category: 'Santas',
    image: '/images/santa-hildegarda-bingen-edited.png',
    description: 'Santa Hildegarda de Bingen com palma e livro, símbolo de sabedoria.',
    details: 'Impressão 3D em resina branca. Santa Hildegarda é representada com seus símbolos característicos: a palma do martírio e o livro de seus escritos. Peça de grande significado espiritual.',
    price: '155.00',
    sizes: ['Pequeno (8x16cm, 100g)', 'Médio (10x30cm, 200g)'],
  },
  {
    id: 4,
    name: 'São Francisco de Assis',
    category: 'Santos',
    image: '/images/sao-francisco-assis-edited.png',
    description: 'Santo Francisco de Assis em pose contemplativa com livro.',
    details: 'Representação tocante de São Francisco em sua postura de contemplação. Impressão em resina branca com detalhes que capturam a serenidade e espiritualidade do santo.',
    price: '160.00',
    sizes: ['Pequeno (8x16cm, 100g)', 'Médio (10x30cm, 200g)'],
  },
  {
    id: 5,
    name: 'São José com Menino Jesus',
    category: 'Santos',
    image: '/images/sao-jose-menino-jesus-real-edited.png',
    description: 'São José segurando o Menino Jesus com ternura e proteção.',
    details: 'Representação tocante da relação entre São José e Jesus. Impressão em resina branca com detalhes delicados que refletem o amor e a proteção de São José.',
    price: '180.00',
    sizes: ['Pequeno (8x16cm, 100g)', 'Médio (10x30cm, 200g)'],
  },
  {
    id: 6,
    name: 'Santo Antônio',
    category: 'Santos',
    image: '/images/sao-jose-coluna-edited.png',
    description: 'Santo Antônio em coluna alta, representação majestosa e contemplativa.',
    details: 'Impressão 3D em resina branca de Santo Antônio. Representação clássica do santo em sua forma contemplativa. Ideal para nichos e altares que exigem maior altura e presença.',
    price: '195.00',
    sizes: ['Pequeno (8x16cm, 100g)', 'Médio (10x30cm, 200g)'],
  },
];

export default function Catalog() {
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | undefined>();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleBuyClick = (product: Product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProduct(undefined), 300);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
    setTimeout(() => setCheckoutProduct(undefined), 300);
  };

  return (
    <section id="catalogo" className="py-20 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <p className="text-accent text-sm font-semibold tracking-widest uppercase">
            Nossos Produtos
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Catálogo de Santos
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Cada peça é uma obra de arte, cuidadosamente impressa em 3D com atenção aos detalhes e qualidade superior.
          </p>
        </div>

        {/* Divisor */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent mb-16"></div>

        {/* Products Grid */}
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
              onBuyClick={() => handleBuyClick(product)}
            />
          ))}
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        product={selectedProduct}
        onClose={handleCloseModal}
        onBuyClick={selectedProduct ? () => handleBuyClick(selectedProduct) : undefined}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && checkoutProduct && (
        <Checkout
          productId={checkoutProduct.id}
          productName={checkoutProduct.name}
          productPrice={checkoutProduct.price}
          onClose={handleCloseCheckout}
        />
      )}
    </section>
  );
}
