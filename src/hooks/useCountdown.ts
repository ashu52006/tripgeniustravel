import { useEffect, useRef, useState, useCallback } from 'react';

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const timer = useRef<number | null>(null);

  const clear = () => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  };

  const start = useCallback((from: number = initialSeconds) => {
    clear();
    setSeconds(from);
    timer.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clear();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [initialSeconds]);

  useEffect(() => {
    start(initialSeconds);
    return clear;
  }, [start, initialSeconds]);

  return { seconds, restart: start, done: seconds === 0 };
}
