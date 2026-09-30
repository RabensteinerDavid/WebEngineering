import { useState, type JSX } from 'react';
import type { BearWithImage } from './models/bear';
import BearArticle from './components/bears/BearArticle';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import RelatedLinks from './components/layout/RelatedLinks';

interface AppProps {
  bears: BearWithImage[];
}

export default function App({ bears }: AppProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header />
      <Navigation onSearch={setSearchQuery} />
      <main>
        <article>
          <BearArticle bears={bears} query={searchQuery} />
        </article>
        <RelatedLinks />
      </main>
      <Footer />
    </>
  );
}
