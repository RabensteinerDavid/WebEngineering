import Highlight from '../search/Highlight';
import { useEffect, useState, type JSX } from 'react';
import { loadBears } from '../../bears';
import type { BearWithImage } from '../../models/bear';
import BearCard from './BearCard';

interface BearListProps {
  query: string;
}

const EMPTY_BEAR_COUNT = 0;

type BearLoadState =
  | { status: 'loading' }
  | { status: 'success'; bears: BearWithImage[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

export default function BearList({ query }: BearListProps): JSX.Element {
  const [state, setState] = useState<BearLoadState>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function fetchBears(): Promise<void> {
      try {
        const bears = await loadBears(signal);
        if (signal.aborted) return;
        setState(
          bears.length === EMPTY_BEAR_COUNT
            ? { status: 'empty' }
            : { status: 'success', bears }
        );
      } catch (error) {
        if (signal.aborted) return;
        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        });
      }
    }

    void fetchBears();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <section className="more_bears">
      <h3>
        <Highlight query={query}>More Bears</Highlight>
      </h3>
      <div className="bear-list" aria-live="polite">
        {state.status === 'loading' && <p>Loading bears…</p>}
        {state.status === 'empty' && <p>No bears found.</p>}
        {state.status === 'error' && (
          <p role="alert">Could not load bears: {state.message}</p>
        )}
        {state.status === 'success' &&
          state.bears.map((bear) => (
            <BearCard key={bear.binomial} bear={bear} query={query} />
          ))}
      </div>
    </section>
  );
}
