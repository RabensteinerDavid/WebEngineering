import { useState, type JSX } from 'react';
import { AuthContext, type User } from './components/auth/AuthContext';
import { useSearchParams } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import RelatedLinks from './components/layout/RelatedLinks';

export default function App(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  function setSearchQuery(query: string): void {
    const next = new URLSearchParams(searchParams);
    if (query === '') next.delete('q');
    else next.set('q', query);
    setSearchParams(next);
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Header />
      <Navigation query={searchQuery} onSearch={setSearchQuery} />
      <main>
        <article>
          <AppRoutes query={searchQuery} />
        </article>
        <RelatedLinks />
      </main>
      <Footer />
    </AuthContext.Provider>
  );
}
