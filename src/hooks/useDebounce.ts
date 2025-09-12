import { useCallback, useEffect, useRef, useState } from "react";

export function useDebounce<TArgs extends readonly unknown[], TReturn>(
  callback: (...args: TArgs) => TReturn,
  delay: number
): (...args: TArgs) => void {
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  return useCallback(
    (...args: TArgs) => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    },
    [callback, delay]
  );
}


export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, React.Dispatch<React.SetStateAction<T>>] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(immediateValue);
    }, delay);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [immediateValue, delay]);

  return [immediateValue, debouncedValue, setImmediateValue];
}