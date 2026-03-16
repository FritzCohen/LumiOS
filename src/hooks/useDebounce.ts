import { useEffect, useRef, useCallback } from "react";

/**
 * Debounces a callback.
 *
 * @param fn      Function to run after debounce
 * @param delay   Delay in ms
 */
export function useDebounce(
  fn: () => void,
  delay: number
) {
  const fnRef = useRef(fn);
  const timerRef = useRef<number | null>(null);

  // Always keep latest fn without retriggering debounce
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const flush = useCallback(() => {
    cancel();
    fnRef.current();
  }, [cancel]);

  const run = useCallback(() => {
    cancel();
    timerRef.current = window.setTimeout(() => {
      fnRef.current();
      timerRef.current = null;
    }, delay);
  }, [cancel, delay]);

  // Cleanup on unmount
  useEffect(() => cancel, [cancel]);

  return { run, cancel, flush };
}