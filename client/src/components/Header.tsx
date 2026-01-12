/**
 * Header Component
 * Design: Minimalismo Sagrado - Header limpo com logo e navegação discreta
 * Cores: Branco fundo, ouro para acentos, cinza para texto
 */

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border/50">
      <div className="container py-6 flex items-center justify-between">
        {/* Logo/Branding */}
        <div className="flex items-center gap-3">
          <img 
            src="/images/logo-simplified.png" 
            alt="Santos Anjos 3D Logo" 
            className="w-10 h-10 flex-shrink-0"
          />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Santos Anjos 3D</h1>
            <p className="text-xs text-muted-foreground tracking-wide">ARTE SACRA EM IMPRESSÃO 3D</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#catalogo" className="text-foreground hover:text-accent transition-colors duration-300">
            Catálogo
          </a>
          <a href="#sobre" className="text-foreground hover:text-accent transition-colors duration-300">
            Sobre
          </a>
          <a href="#contato" className="text-foreground hover:text-accent transition-colors duration-300">
            Contato
          </a>
        </nav>

        {/* WhatsApp CTA */}
        <a
          href="https://wa.me/5511999999999?text=Olá! Gostaria de conhecer mais sobre os santos impressos em 3D."
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition-colors duration-300 font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.289-5.044 5.933-5.044 9.869 0 1.71.372 3.342 1.076 4.788L1.07 23.5l5.102-1.62c1.39.757 2.982 1.156 4.566 1.156 5.209 0 9.449-4.24 9.449-9.449 0-2.524-1.076-4.897-3.012-6.66-1.936-1.762-4.5-2.729-7.236-2.729z"/>
          </svg>
          WhatsApp
        </a>
      </div>
    </header>
  );
}
