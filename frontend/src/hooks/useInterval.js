import { useEffect, useRef } from 'react';

// Calls `callback` every `ms` milliseconds (skips while the tab is hidden or `paused` is true).
export function useInterval(callback, ms, paused = false) {
  const saved = useRef(callback);
  useEffect(() => { saved.current = callback; });
  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => { if (!document.hidden) saved.current(); }, ms);
    return () => clearInterval(id);
  }, [ms, paused]);
}
