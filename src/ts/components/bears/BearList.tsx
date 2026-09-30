import Highlight from '../search/Highlight';
import type { JSX } from 'react';
import useBears from '../../hooks/useBears';
import { Link, useLocation } from 'react-router-dom';
import BearCard from './BearCard';

interface BearListProps {
  query: string;
}

export default function BearList({ query }: BearListProps): JSX.Element {
  const state = useBears();
  const { search } = useLocation();

  return (
    <section className="more_bears">
      <h3>
        <Highlight query={query}>More Bears</Highlight>
      </h3>
      <div className="bear-list" aria-live="polite">
        {state.status === 'loading' && <p>Loading bears...</p>}
        {state.status === 'empty' && <p>No bears found.</p>}
        {state.status === 'error' && (
          <p role="alert">Could not load bears: {state.message}</p>
        )}
        {state.status === 'success' &&
          state.bears.map((bear) => (
            <div key={bear.binomial}>
              <BearCard bear={bear} query={query} />
              <Link to={`/bears/${encodeURIComponent(bear.binomial)}${search}`}>
                <Highlight
                  query={query}
                >{`Details for ${bear.name}`}</Highlight>
              </Link>
            </div>
          ))}
      </div>
    </section>
  );
}
