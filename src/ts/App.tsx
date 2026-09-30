import { useState, type JSX } from 'react';
import BearArticle from './components/bears/BearArticle';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import RelatedLinks from './components/layout/RelatedLinks';

export default function App(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <Header />
      <Navigation onSearch={setSearchQuery} />
      <main>
        <article>
          <BearArticle query={searchQuery} />
        </article>
        <RelatedLinks />
      </main>
      <Footer />
    </>
  );
}
