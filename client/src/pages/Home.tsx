/**
 * Home Page
 * Design: Minimalismo Sagrado com Foco em Escultura
 * Componentes: Header, Hero, Catalog, About, Footer
 */

import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Catalog from '@/components/Catalog';
import About from '@/components/About';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Hero />
        <Catalog />
        <About />
      </main>
      <Footer />
    </div>
  );
}
