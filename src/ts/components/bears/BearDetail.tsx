import type { JSX } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import useBears from '../../hooks/useBears';
import BearCard from './BearCard';
import Highlight from '../search/Highlight';

interface BearDetailProps {
  query: string;
}

export default function BearDetail({ query }: BearDetailProps): JSX.Element {
  const { bearId } = useParams();
  const { search } = useLocation();
  const state = useBears();
  const bear =
    state.status === 'success'
      ? state.bears.find((entry) => entry.binomial === bearId)
      : undefined;

  return (
    <section>
      <Link to={`/bears${search}`}>Back to bears</Link>
      <div aria-live="polite">
        {state.status === 'loading' && <p>Loading bear...</p>}
        {state.status === 'error' && (
          <p role="alert">Could not load bear: {state.message}</p>
        )}
        {(state.status === 'empty' ||
          (state.status === 'success' && bear === undefined)) && (
          <h2>Bear not found</h2>
        )}
        {bear !== undefined && (
          <>
            <h2>
              <Highlight query={query}>{bear.name}</Highlight>
            </h2>
            <BearCard bear={bear} query={query} />
          </>
        )}
      </div>
    </section>
  );
}
