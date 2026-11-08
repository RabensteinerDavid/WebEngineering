import { useEffect, useState } from 'react';
import { loadBears } from '../bears';
import type { BearWithImage } from '../models/bear';

const EMPTY_BEAR_COUNT = 0;

type BearLoadState =
  | { status: 'loading' }
  | { status: 'success'; bears: BearWithImage[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

export default function useBears(): BearLoadState {
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

  return state;
}
