import Highlight from '../search/Highlight';
import type { JSX } from 'react';
import type { BearWithImage } from '../../models/bear';

interface BearCardProps {
  query: string;
  bear: BearWithImage;
}

export default function BearCard({ bear, query }: BearCardProps): JSX.Element {
  return (
    <div className="bear">
      <img src={bear.image} alt={`Image of ${bear.name}`} />
      <p>
        <b>
          <Highlight query={query}>{bear.name}</Highlight>
        </b>{' '}
        (<Highlight query={query}>{bear.binomial}</Highlight>)
      </p>
      <p>
        <Highlight query={query}>{`Range: ${bear.range}`}</Highlight>
      </p>
    </div>
  );
}
