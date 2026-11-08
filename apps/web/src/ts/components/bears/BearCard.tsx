import Highlight from '../search/Highlight';
import type { JSX } from 'react';
import { PLACEHOLDER_IMAGE } from '../../bears';
import type { BearWithImage } from '../../models/bear';

interface BearCardProps {
  query: string;
  bear: BearWithImage;
}

export default function BearCard({ bear, query }: BearCardProps): JSX.Element {
  return (
    <div className="bear">
      <img
        src={bear.image}
        alt={`Image of ${bear.name}`}
        onError={(event) => {
          const { currentTarget: image } = event;
          if (image.getAttribute('src') !== PLACEHOLDER_IMAGE) {
            image.src = PLACEHOLDER_IMAGE;
          }
        }}
      />
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
