export const removeUndefined = <T extends Record<string, unknown>>(
  withUndefined: T
): { [K in keyof T]: NonNullable<T[K]> } => {
  return Object.fromEntries(
    Object.entries(withUndefined).filter(([, value]) => value !== undefined)
  ) as { [K in keyof T]: NonNullable<T[K]> };
};
