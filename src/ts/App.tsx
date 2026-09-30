import type { JSX } from 'react';
import type { BearWithImage } from './models/bear';
import BearArticle from './components/bears/BearArticle';
import Comments from './components/comments/Comments';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import RelatedLinks from './components/layout/RelatedLinks';

interface AppProps {
  bears: BearWithImage[];
}

export default function App({ bears }: AppProps): JSX.Element {
  return (
    <>
      <Header />
      <Navigation />
      <main>
        <article>
          <BearArticle bears={bears} />
          <Comments />
        </article>
        <RelatedLinks />
      </main>
      <Footer />
    </>
  );
}
