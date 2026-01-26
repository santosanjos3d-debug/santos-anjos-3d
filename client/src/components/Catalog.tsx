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
    description: 'Estatueta de Nossa Senhora de Lourdes em PETG com filamento fundido, branca com detalhes delicados.',
    details: 'Impressão 3D de alta qualidade em PETG com filamento fundido. Cada detalhe foi cuidadosamente capturado para refletir a beleza e serenidade de Nossa Senhora de Lourdes, padroeira dos doentes.',
    price: '29,33',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 2,
    name: 'Sagrado Coração de Maria',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-edited.png',
    description: 'Representação do Sagrado Coração de Maria em PETG com filamento fundido, branca.',
    details: 'Impressão 3D em PETG com filamento fundido de alta qualidade. Captura a devoção e amor do Sagrado Coração de Maria com detalhes precisos e acabamento fino.',
    price: '40,85',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 3,
    name: 'Santa Gianna',
    category: 'Santas',
    image: '/images/santa-gianna-edited.png',
    description: 'Santa Gianna em representação serena e contemplativa.',
    details: 'Impressão 3D em PETG com filamento fundido de Santa Gianna, mãe e santa moderna. Peça inspiradora para famílias cristãs.',
    price: '43,18',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 4,
    name: 'Santa Hildegarda de Bingen',
    category: 'Santas',
    image: '/images/santa-hildegarda-bingen-edited.png',
    description: 'Santa Hildegarda de Bingen com palma e livro, símbolo de sabedoria.',
    details: 'Impressão 3D em PETG com filamento fundido. Santa Hildegarda é representada com seus símbolos característicos: a palma do martírio e o livro de seus escritos. Peça de grande significado espiritual.',
    price: '40,58',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 5,
    name: 'São Francisco de Assis',
    category: 'Santos',
    image: '/images/sao-francisco-assis-edited.png',
    description: 'São Francisco de Assis em contemplação, com pombas e natureza.',
    details: 'Impressão 3D em PETG com filamento fundido. São Francisco é representado em sua característica pose contemplativa, cercado pelos símbolos da natureza que ele tão profundamente amava e respeitava.',
    price: '35,10',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 6,
    name: 'São José com Menino Jesus',
    category: 'Santos',
    image: '/images/sao-jose-menino-jesus-real-edited.png',
    description: 'São José segurando o Menino Jesus com ternura e proteção.',
    details: 'Impressão 3D em PETG com filamento fundido. Esta representação captura o amor paternal de São José e sua devoção ao Menino Jesus. Peça perfeita para lares cristãos.',
    price: '39,38',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 7,
    name: 'Santo Antônio',
    category: 'Santos',
    image: '/images/santo-antonio-edited.png',
    description: 'Santo Antônio com o Menino Jesus, santo do amor e da família.',
    details: 'Impressão 3D em PETG com filamento fundido. Santo Antônio é representado com o Menino Jesus em seus braços, simbolizando proteção, amor e fé. Peça tradicional muito venerada.',
    price: '32,43',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 8,
    name: 'São Bento',
    category: 'Santos',
    image: '/images/sao-bento-edited.png',
    description: 'São Bento em vestes monásticas, fundador da ordem beneditina.',
    details: 'Impressão 3D em PETG com filamento fundido. São Bento é representado em suas vestes monásticas, com a cruz e o livro de sua regra. Símbolo de sabedoria espiritual e vida contemplativa.',
    price: '39,15',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 9,
    name: 'São José Josemaria',
    category: 'Santos',
    image: '/images/sao-josemaria-edited.png',
    description: 'São Josemaria em representação serena e contemplativa.',
    details: 'Impressão 3D em PETG com filamento fundido de São Josemaria. Fundador do Opus Dei, representa a santidade na vida ordinária. Peça inspiradora para leigos cristãos.',
    price: '29,13',
    sizes: ['Pequeno (144mm)'],
  },
  {
    id: 10,
    name: 'São Miguel Pequeno',
    category: 'Arcanjos',
    image: '/images/sao-miguel-medio-edited.png',
    description: 'São Miguel Arcanjo em postura triunfante sobre o demônio.',
    details: 'Impressão 3D em PETG com filamento fundido. São Miguel é representado como protetor e guerreiro espiritual, com asas majestosas e lança. Símbolo de vitória sobre o mal.',
    price: '44,28',
    sizes: ['Pequeno (94mm)'],
  },
  {
    id: 11,
    name: 'São Miguel Médio',
    category: 'Arcanjos',
    image: '/images/sao-miguel-medio-edited.png',
    description: 'São Miguel Arcanjo em postura triunfante sobre o demônio.',
    details: 'Impressão 3D em PETG com filamento fundido. São Miguel é representado como protetor e guerreiro espiritual, com asas majestosas e lança. Símbolo de vitória sobre o mal.',
    price: '77,45',
    sizes: ['Médio (308mm)'],
  },
  {
    id: 12,
    name: 'Nossa Senhora de Lourdes Grande - Branca',
    category: 'Nossa Senhora',
    image: '/images/sagrado-coracao-maria-edited.png',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor branca.',
    details: 'Impressão 3D em PETG com filamento fundido branca de Nossa Senhora de Lourdes em tamanho maior. Ideal para capelas e espaços maiores. Versão clássica em branco puro.',
    price: '73,13',
    sizes: ['Grande (288mm)'],
  },
  {
    id: 13,
    name: 'Nossa Senhora de Lourdes Grande - Marrom',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-grande-marrom-real-edited.png',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor marrom.',
    details: 'Impressão 3D em PETG com filamento fundido marrom de Nossa Senhora de Lourdes em tamanho maior. Versão em tom madeira quente, ideal para ambientes com decoração rústica.',
    price: '73,13',
    sizes: ['Grande (288mm)'],
  },
  {
    id: 14,
    name: 'Nossa Senhora de Lourdes Grande - Verde',
    category: 'Nossa Senhora',
    image: '/images/nossa-senhora-lourdes-grande-verde-real-edited.png',
    description: 'Nossa Senhora de Lourdes em tamanho grande, cor verde.',
    details: 'Impressão 3D em PETG com filamento fundido verde de Nossa Senhora de Lourdes em tamanho maior. Versão em tom verde natural, trazendo frescor e conexão com a natureza.',
    price: '73,13',
    sizes: ['Grande (288mm)'],
  },
];

export default function Catalog() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Catálogo de Peças
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada peça é uma obra de arte cuidadosamente impressa em 3D, celebrando a fé e a espiritualidade com detalhes extraordinários.
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
              onDetailsClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      </div>

      <ProductModal
        isOpen={selectedProduct !== null}
        product={selectedProduct || undefined}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
