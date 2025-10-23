'use client';

import { SOLANA_MEDIA } from '@/constants/clientRoutes';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

//DEPRECATED - reroute to "artworks" route
export default function SolanaAssetPage() {
  const { id }= useParams<{id: string}>()
  const router = useRouter()

  useEffect(() => {
    router.push(SOLANA_MEDIA(id));
  }, [])
  
  return null
}
