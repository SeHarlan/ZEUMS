export const removeUndefined = <T extends Record<string, unknown>>(
  withUndefined: T
): { [K in keyof T]: NonNullable<T[K]> } => {
  return Object.fromEntries(
    Object.entries(withUndefined).filter(([, value]) => value !== undefined)
  ) as { [K in keyof T]: NonNullable<T[K]> };
};

/**
 * Adds https:// prefix to URLs that don't already have a protocol
 */
export const addHttpsPrefix = (url: string): string => {
  if (!url) return url;
  
  // If URL already has a protocol, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add https:// prefix
  return `https://${url}`;
};

export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T & { cancel: () => void } => {
  let timeout: NodeJS.Timeout;
  
  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  
  const cancel = () => {
    clearTimeout(timeout);
  };
  
  // Add cancel method to the debounced function
  Object.assign(debounced, { cancel });
  
  return debounced as T & { cancel: () => void };
};