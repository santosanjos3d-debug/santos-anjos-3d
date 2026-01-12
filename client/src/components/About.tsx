/**
 * About Component
 * Design: Minimalismo Sagrado - Seção sobre a marca com layout assimétrico
 */

export default function About() {
  return (
    <section id="sobre" className="py-20 bg-secondary/30">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left: Image */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src="/images/angels-collection.jpg"
              alt="Coleção de Santos 3D"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Right: Content */}
          <div className="space-y-6">
            <div>
              <p className="text-accent text-sm font-semibold tracking-widest uppercase mb-2">
                Sobre Nós
              </p>
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Fé e Tecnologia Unidas
              </h2>
            </div>

            <div className="space-y-4 text-foreground/80 leading-relaxed">
              <p>
                A <span className="font-semibold text-foreground">Santos Anjos 3D</span> nasceu da paixão por unir tradição espiritual com inovação tecnológica. Cada peça é impressa em 3D com precisão extraordinária, capturando os detalhes mais delicados das representações sagradas.
              </p>

              <p>
                Utilizamos resina de alta qualidade e técnicas avançadas de impressão 3D para criar estatuetas que não são apenas belas, mas também duráveis e significativas. Cada santo é uma obra de arte que traz proteção e inspiração para seu lar.
              </p>

              <p>
                Acreditamos que a fé merece ser celebrada com qualidade e elegância. Por isso, dedicamos tempo e cuidado em cada detalhe, desde a modelagem até o acabamento final.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <div className="text-2xl font-bold text-accent">100%</div>
                <p className="text-sm text-foreground/70">Qualidade Premium</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-accent">∞</div>
                <p className="text-sm text-foreground/70">Durável e Eterno</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-accent">✓</div>
                <p className="text-sm text-foreground/70">Personalização</p>
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-accent">♥</div>
                <p className="text-sm text-foreground/70">Feito com Amor</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
