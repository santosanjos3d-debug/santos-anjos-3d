/**
 * ProductCard Component
 * Design: Minimalismo Sagrado - Cartão com sombra suave, hover com elevação
 * Interação: Hover eleva o cartão, clique abre detalhes
 */

interface ProductCardProps {
  id: string;
  name: string;
  category: string;
  image: string;
  description: string;
  onClick?: () => void;
}

export default function ProductCard({
  name,
  category,
  image,
  description,
  onClick,
}: ProductCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer card-minimal overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
    >
      {/* Image Container */}
      <div className="relative h-80 overflow-hidden bg-secondary">
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

        {/* CTA Button */}
        <div className="pt-4 border-t border-border/50">
          <button className="w-full py-2 text-accent font-semibold hover:text-accent/80 transition-colors duration-300 text-sm uppercase tracking-wide">
            Ver Detalhes →
          </button>
        </div>
      </div>
    </div>
  );
}
