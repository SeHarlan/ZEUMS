import { PrimitiveAtom, useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { useMemo } from "react";


export const useFocusAtom = <T extends string, V>(
  atom: PrimitiveAtom<Record<T, V>>,
  key: T
) => {
  const focusedAtom = useMemo(
    () => focusAtom(atom, (optic) => optic.prop(key)),
    [atom, key]
  );

  return useAtom(focusedAtom);
};
