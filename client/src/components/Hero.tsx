/**
 * Hero Section Component
 * Design: Minimalismo Sagrado - Imagem grande de Nossa Senhora com bokeh dourado
 * Foco: Celebrar a qualidade e detalhes das peças 3D
 */

export default function Hero() {
  return (
    <section className="relative w-full bg-background overflow-hidden">
      {/* Background image com overlay suave */}
      <div className="relative h-[600px] md:h-[700px] w-full flex items-center justify-center">
        <img
          src="/images/hero-banner.jpg"
          alt="Nossa Senhora - Impressão 3D"
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay gradiente suave */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40"></div>

        {/* Content overlay */}
        <div className="relative z-10 container text-center max-w-2xl mx-auto px-4">
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <p className="text-accent text-sm font-semibold tracking-widest uppercase">
                Bem-vindo à Santos Anjos 3D
              </p>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                Arte Sacra em Impressão 3D
              </h1>
            </div>
            
            <p className="text-lg text-foreground/80 max-w-xl mx-auto leading-relaxed">
              Cada peça é uma obra de arte cuidadosamente impressa em 3D, celebrando a fé e a espiritualidade com detalhes extraordinários.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href="#catalogo"
                className="px-8 py-3 bg-accent text-background rounded-lg font-semibold hover:bg-accent/90 transition-all duration-300 hover:shadow-lg"
              >
                Ver Catálogo
              </a>
              <a
                href="https://wa.me/5547996641959?text=Olá! Gostaria de conhecer mais sobre os santos impressos em 3D."
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 border-2 border-accent text-accent rounded-lg font-semibold hover:bg-accent/10 transition-all duration-300"
              >
                Fale Conosco
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Divisor decorativo */}
      <div className="h-px bg-gradient-to-r from-transparent via-accent to-transparent"></div>
    </section>
  );
}
