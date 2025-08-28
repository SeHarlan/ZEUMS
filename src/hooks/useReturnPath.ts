import { useSearchParams } from "next/navigation";
import { RETURN_QUERY_PARAM } from "@/constants/clientRoutes";
import { getReturnPath } from "@/utils/navigation";


export const useReturnPath = (fallback?: string): string | null => {
  const searchParams = useSearchParams();
  const returnKey = searchParams.get(RETURN_QUERY_PARAM);
  
  if (returnKey) { 
    return getReturnPath(returnKey);
  }

  return fallback || null;
};
