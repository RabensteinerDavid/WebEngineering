import Highlight from '../search/Highlight';
import type { JSX } from 'react';
import type { BearWithImage } from '../../models/bear';
import BearCard from './BearCard';

interface BearListProps {
  query: string;
  bears: BearWithImage[];
}

export default function BearList({ bears, query }: BearListProps): JSX.Element {
  return (
    <section className="more_bears">
      <h3>
        <Highlight query={query}>More Bears</Highlight>
      </h3>
      <div className="bear-list" aria-live="polite">
        {bears.map((bear) => (
          <BearCard key={bear.binomial} bear={bear} query={query} />
        ))}
      </div>
    </section>
  );
}
