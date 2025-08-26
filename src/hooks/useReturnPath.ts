import { useRouter } from "next/router";
import { RETURN_QUERY_PARAM } from "@/constants/clientRoutes";
import { getReturnPath } from "@/utils/navigation";

export const useReturnPath = (fallback?: string): string | null => {
  const router = useRouter();
  const fromParam = router.query[RETURN_QUERY_PARAM] as string;
  
  if (!fromParam) {
    return fallback || null
  }
  
  return getReturnPath(fromParam);
};
