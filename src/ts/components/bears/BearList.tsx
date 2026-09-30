import type { JSX } from 'react';
import type { BearWithImage } from '../../models/bear';
import BearCard from './BearCard';

interface BearListProps {
  bears: BearWithImage[];
}

export default function BearList({ bears }: BearListProps): JSX.Element {
  return (
    <section className="more_bears">
      <h3>More Bears</h3>
      <div className="bear-list" aria-live="polite">
        {bears.map((bear) => (
          <BearCard key={bear.binomial} bear={bear} />
        ))}
      </div>
    </section>
  );
}
