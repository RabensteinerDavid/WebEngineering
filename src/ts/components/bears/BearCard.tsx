import type { JSX } from 'react';
import type { BearWithImage } from '../../models/bear';

interface BearCardProps {
  bear: BearWithImage;
}

export default function BearCard({ bear }: BearCardProps): JSX.Element {
  return (
    <div className="bear">
      <img src={bear.image} alt={`Image of ${bear.name}`} />
      <p>
        <b>{bear.name}</b> ({bear.binomial})
      </p>
      <p>Range: {bear.range}</p>
    </div>
  );
}
