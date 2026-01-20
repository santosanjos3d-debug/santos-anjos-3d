/**
 * ProductModal Component
 * Design: Minimalismo Sagrado - Modal com imagem grande e CTA WhatsApp destacado
 */

import { X } from 'lucide-react';

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
    sizes?: string[];
  };
  onClose: () => void;
  onBuyClick?: () => void;
}

export default function ProductModal({ isOpen, product, onClose }: ProductModalProps) {
  if (!isOpen || !product) return null;

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
              src={product.image}
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

          {/* Sizes if available */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Tamanhos Disponíveis</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="px-4 py-2 border border-border rounded-lg text-sm text-foreground hover:border-accent transition-colors duration-300 cursor-pointer"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp CTA */}
          <div className="border-t border-border/50 pt-6">
            <a
              href={`https://wa.me/5511999999999?text=Olá! Gostaria de encomendar: ${product.name}`}
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
