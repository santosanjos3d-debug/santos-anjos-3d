/**
 * Home Page
 * Design: Minimalismo Sagrado com Foco em Escultura
 * Componentes: Header, Hero, Catalog, About, Footer
 */

import { useAuth } from '@/_core/hooks/useAuth';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Catalog from '@/components/Catalog';
import About from '@/components/About';
import Footer from '@/components/Footer';

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

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
