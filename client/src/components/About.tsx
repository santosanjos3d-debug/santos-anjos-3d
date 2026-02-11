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
                A <span className="font-semibold text-foreground">Santos Anjos 3D</span> foi criada com o propósito de integrar tradição religiosa e tecnologia de fabricação digital. Desenvolvemos imagens sacras por meio de impressão 3D de alta precisão, assegurando fidelidade nos detalhes e consistência dimensional em cada peça.
              </p>

              <p>
                Utilizamos Polietileno Tereftalato Glicol (PETG), um polímero termoplástico amplamente empregado na indústria por sua resistência mecânica, estabilidade e durabilidade. No contexto da impressão 3D, o PETG oferece boa definição geométrica, baixa retração e excelente desempenho estrutural, resultando em peças robustas e com acabamento uniforme.
              </p>

              <p>
                Cada modelo é cuidadosamente preparado em ambiente digital, passando por etapas de ajuste, validação e otimização antes da fabricação. O processo produtivo é conduzido com controle técnico, garantindo qualidade, repetibilidade e integridade da peça final.
              </p>

              <p>
                Nosso compromisso é oferecer representações religiosas produzidas com rigor técnico, materiais adequados e acabamento consistente, respeitando tanto o significado simbólico quanto os critérios de qualidade do produto.
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
