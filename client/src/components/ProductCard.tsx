/**
 * ProductCard Component
 * Design: Minimalismo Sagrado - Cartão com sombra suave, hover com elevação
 * Interação: Hover eleva o cartão, clique abre detalhes
 */

interface ProductCardProps {
  id: number;
  name: string;
  category: string;
  image: string;
  description: string;
  price: string;
  onBuyClick?: () => void;
  onDetailsClick?: () => void;
}

export default function ProductCard({
  name,
  category,
  image,
  description,
  price,
  onBuyClick,
  onDetailsClick,
}: ProductCardProps) {
  return (
    <div className="group card-minimal overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
      {/* Image Container */}
      <div 
        className="relative h-80 overflow-hidden bg-secondary cursor-pointer"
        onClick={onDetailsClick}
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-accent text-background px-3 py-1 rounded-full text-xs font-semibold">
          {category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>

        {/* Price */}
        <div className="pt-2 border-t border-border/50">
          <p className="text-lg font-bold text-accent">R$ {price.replace('.', ',')}</p>
        </div>

        {/* CTA Buttons */}
        <div className="pt-2 space-y-2">
          <button 
            onClick={onBuyClick}
            className="w-full py-2 bg-accent text-background font-semibold hover:bg-accent/90 transition-colors duration-300 text-sm uppercase tracking-wide rounded"
          >
            Comprar Agora
          </button>
          <button 
            onClick={onDetailsClick}
            className="w-full py-2 text-accent font-semibold hover:text-accent/80 transition-colors duration-300 text-sm uppercase tracking-wide"
          >
            Ver Detalhes →
          </button>
        </div>
      </div>
    </div>
  );
}
