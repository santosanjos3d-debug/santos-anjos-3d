/**
 * ProductModal Component
 * Design: Minimalismo Sagrado - Modal com imagem grande, seletor de cores, tamanhos com preço dinâmico e CTA WhatsApp destacado
 */

import { useState } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useCartWithSync } from '@/_core/hooks/useCartWithSync';

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

interface ProductModalProps {
  isOpen: boolean;
  product?: {
    id: number;
    name: string;
    category: string;
    image: string;
    description: string;
    details: string;
    price: string;
    sizes?: ProductSize[];
    colors?: ProductColor[];
  };
  onClose: () => void;
  onBuyClick?: () => void;
}

export default function ProductModal({ isOpen, product, onClose }: ProductModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors?.[0]?.value || 'white');
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0]?.size || 'P');
  const [selectedImage, setSelectedImage] = useState<string>(product?.image || '');
  const { addItem } = useCartWithSync();
  const [addedToCart, setAddedToCart] = useState(false);

  if (!isOpen || !product) return null;

  const currentColor = product.colors?.find(c => c.value === selectedColor);
  const currentSize = product.sizes?.find(s => s.size === selectedSize);
  const displayImage = currentColor?.image || product.image;
  const displayPrice = currentSize?.price || product.price;
  const displayLabel = currentSize?.label || 'Tamanho';

  const handleColorChange = (colorValue: string, colorImage: string) => {
    setSelectedColor(colorValue);
    setSelectedImage(colorImage);
  };

  const handleSizeChange = (sizeValue: string) => {
    setSelectedSize(sizeValue);
  };

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: displayImage,
      color: currentColor?.name as 'Branco' | 'Marrom' | 'Verde',
      size: selectedSize as 'P' | 'M' | 'G',
      sizeLabel: displayLabel,
      price: displayPrice,
      quantity: 1,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header com close button */}
        <div className="sticky top-0 bg-background border-b border-border/50 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{product.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors duration-300"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="rounded-lg overflow-hidden bg-secondary">
            <img
              src={displayImage}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Category Badge */}
          <div className="inline-block bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold">
            {product.category}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className="text-foreground/80 leading-relaxed">{product.description}</p>
            <p className="text-foreground/70 text-sm leading-relaxed">{product.details}</p>
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Escolha o Tamanho</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((sizeOption) => (
                  <button
                    key={sizeOption.size}
                    onClick={() => handleSizeChange(sizeOption.size)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      selectedSize === sizeOption.size
                        ? 'bg-accent text-background border-2 border-accent'
                        : 'border-2 border-border text-foreground hover:border-accent'
                    }`}
                  >
                    <div className="text-sm">{sizeOption.size}</div>
                    <div className="text-xs opacity-75">{sizeOption.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Escolha a Cor</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => handleColorChange(color.value, color.image)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      selectedColor === color.value
                        ? 'bg-accent text-background border-2 border-accent'
                        : 'border-2 border-border text-foreground hover:border-accent'
                    }`}
                  >
                    {color.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price Display */}
          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{displayLabel}</p>
                <p className="text-3xl font-bold text-accent">R$ {displayPrice}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Cor: {currentColor?.name || 'Padrão'}</p>
              </div>
            </div>
          </div>

          {/* Add to Cart and WhatsApp CTA */}
          <div className="border-t border-border/50 pt-6 space-y-3">
            <button
              onClick={handleAddToCart}
              className={`w-full py-3 rounded-lg font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              <ShoppingCart size={20} />
              {addedToCart ? 'Adicionado ao Carrinho!' : 'Adicionar ao Carrinho'}
            </button>
            <a
              href={`https://wa.me/5547996641959?text=Olá! Gostaria de encomendar: ${product.name} - Tamanho: ${displayLabel} - Cor: ${currentColor?.name || 'Padrão'} - Preço: R$ ${displayPrice}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-accent text-background rounded-lg font-bold text-lg hover:bg-accent/90 transition-all duration-300 text-center hover:shadow-lg"
            >
              Encomendar via WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
