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
    name: 'Nossa Senhora Aparecida',
    category: 'Nossa Senhora',
    image: '/images/hero-banner.jpg',
    description: 'Estatueta de Nossa Senhora Aparecida em resina branca com detalhes em ouro.',
    details: 'Impressão 3D de alta qualidade em resina branca. Cada detalhe foi cuidadosamente capturado para refletir a beleza e serenidade da Padroeira do Brasil.',
    price: '150.00',
    sizes: ['Pequeno (15cm)', 'Médio (25cm)', 'Grande (35cm)'],
  },
  {
    id: 2,
    name: 'São Miguel Arcanjo',
    category: 'Arcanjos',
    image: '/images/saint-michael.jpg',
    description: 'Arcanjo São Miguel em pose de vitória sobre o demônio.',
    details: 'Representação clássica de São Miguel em sua postura de protetor. Impressão em resina com acabamento fino e detalhes em ouro.',
    price: '180.00',
    sizes: ['Pequeno (20cm)', 'Médio (30cm)', 'Grande (40cm)'],
  },
  {
    id: 3,
    name: 'São Francisco de Assis',
    category: 'Santos',
    image: '/images/saint-francis.jpg',
    description: 'Santo Francisco cercado por animais em gesto de paz.',
    details: 'Captura a essência da compaixão de São Francisco. Peça detalhada com animais ao seu redor, simbolizando seu amor pela criação.',
    price: '165.00',
    sizes: ['Pequeno (18cm)', 'Médio (28cm)', 'Grande (38cm)'],
  },
  {
    id: 4,
    name: 'São José com Menino Jesus',
    category: 'Santos',
    image: '/images/saint-joseph.jpg',
    description: 'São José segurando o Menino Jesus com ternura.',
    details: 'Representação tocante da relação entre São José e Jesus. Impressão em resina branca com detalhes delicados em ouro.',
    price: '195.00',
    sizes: ['Pequeno (22cm)', 'Médio (32cm)', 'Grande (42cm)'],
  },
  {
    id: 5,
    name: 'Coleção de Anjos',
    category: 'Anjos',
    image: '/images/angels-collection.jpg',
    description: 'Conjunto variado de anjos em diferentes poses e tamanhos.',
    details: 'Coleção completa de anjos para criar um ambiente de paz e proteção. Cada anjo é único e pode ser adquirido individualmente ou em conjunto.',
    price: '299.00',
    sizes: ['Conjunto Completo', 'Anjo Individual'],
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
