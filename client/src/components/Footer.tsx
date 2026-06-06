/**
 * Footer Component
 * Design: Minimalismo Sagrado - Footer elegante com informações de contato
 */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container">
        {/* Divisor */}
        <div className="h-px bg-background/20 mb-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img 
                src="https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/logo-simplified-u8oZdUZkuko3bNg1R9lUHFn1RVGkZP.png" 
                alt="Santos Anjos 3D Logo" 
                className="w-10 h-10 flex-shrink-0 invert"
              />
              <div>
                <h3 className="text-xl font-bold">Santos Anjos 3D</h3>
                <p className="text-xs opacity-70 tracking-wide">ARTE SACRA EM IMPRESSÃO 3D</p>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Celebrando a fé através da tecnologia e da arte. Cada peça é uma obra sagrada.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#catalogo" className="opacity-80 hover:opacity-100 transition-opacity duration-300">
                  Catálogo
                </a>
              </li>
              <li>
                <a href="#sobre" className="opacity-80 hover:opacity-100 transition-opacity duration-300">
                  Sobre Nós
                </a>
              </li>
              <li>
                <a href="#contato" className="opacity-80 hover:opacity-100 transition-opacity duration-300">
                  Contato
                </a>
              </li>
              <li>
                <a href="#" className="opacity-80 hover:opacity-100 transition-opacity duration-300">
                  Política de Privacidade
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Entre em Contato</h4>
            <div className="space-y-3 text-sm">
              <a
                href="https://wa.me/5547996641959"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity duration-300"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.289-5.044 5.933-5.044 9.869 0 1.71.372 3.342 1.076 4.788L1.07 23.5l5.102-1.62c1.39.757 2.982 1.156 4.566 1.156 5.209 0 9.449-4.24 9.449-9.449 0-2.524-1.076-4.897-3.012-6.66-1.936-1.762-4.5-2.729-7.236-2.729z"/>
                </svg>
                WhatsApp
              </a>
              <p className="opacity-80">
                Disponível para dúvidas e encomendas
              </p>
            </div>
          </div>
        </div>

        {/* Divisor */}
        <div className="h-px bg-background/20 my-12"></div>

        {/* Copyright */}
        <div className="text-center text-sm opacity-70">
          <p>
            © {currentYear} Santos Anjos 3D. Todos os direitos reservados.
          </p>
          <p className="mt-2 text-xs opacity-60">
            Feito com ❤️ e fé
          </p>
        </div>
      </div>
    </footer>
  );
}
