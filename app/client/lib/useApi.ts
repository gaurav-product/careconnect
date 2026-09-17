import { useCallback, useEffect, useState } from 'react';
import { api, RequestError } from './api';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status: number | null;
}

/** Tiny fetch-on-mount hook with an explicit reload, so every screen can show
 *  loading, empty and error states without pulling in a data-fetching library. */
export function useApi<T>(path: string | null, deps: unknown[] = []): State<T> & { reload: () => void } {
  const [state, setState] = useState<State<T>>({ data: null, loading: Boolean(path), error: null, status: null });
  const [nonce, setNonce] = useState(0);

  const load = useCallback(async () => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await api.get<T>(path);
      setState({ data, loading: false, error: null, status: 200 });
    } catch (e) {
      const err = e as RequestError;
      setState({ data: null, loading: false, error: err.message, status: err.status ?? null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, nonce]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, nonce, ...deps]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}
