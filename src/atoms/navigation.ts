import { atom, useAtom, useSetAtom } from "jotai";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export const navBarVisibleAtom = atom<boolean>(true);

const MAX_HISTORY_LENGTH = 6; //will include the current page so -1 this is the levels of history
export const pathHistoryAtom = atom<Array<string>>([]);
const baseShowReturnButton = atom<boolean>(false);

export const showReturnButtonAtom = atom<boolean>((get) => {
  const show = get(baseShowReturnButton);
  const paths = get(pathHistoryAtom);
  return show && paths.length > 1; //only one means there is no previous page
});

export const useShowReturnButton = () => {
  const setShow = useSetAtom(baseShowReturnButton);

  useEffect(() => {
    setShow(true);
    return () => {
      setShow(false);
    }
  }, [setShow])
};

export const getReturnPathAtom = atom((get) => {
  const paths = get(pathHistoryAtom);
  return paths[paths.length - 2];
})

export const useReturnPath = () => {
  const [paths, setPaths] = useAtom(pathHistoryAtom);
  const pathname = usePathname();
  const router = useRouter();

  // Clear return path when pathname changes (but not on initial mount)
  useEffect(() => {
    setPaths((prev) => {
      if (prev[prev.length - 1] === pathname) {
        return prev;
      }
      const newHistory = [...prev, pathname];

      if (newHistory.length > MAX_HISTORY_LENGTH) {
        newHistory.shift();
      }

      return newHistory;
    });
  }, [pathname, setPaths]);

  const callReturnPath = () => {
    if (paths.length <= 1) return;
    
    const newPaths = paths.slice(0, -1)
    const returnPath = newPaths[newPaths.length - 1];

    setPaths(newPaths);

    router.push(returnPath);
  }

  return callReturnPath;
};