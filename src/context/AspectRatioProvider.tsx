"use client";
 
import { ParsedBlockChainAsset } from "@/types/asset";
import { createContext, useContext, useState, ReactNode } from "react";

interface AspectRatioContextType {
  aspectRatios: Map<string, number>;
  setAspectRatio: (asset: ParsedBlockChainAsset, ratio: number) => void;
  getAspectRatio: (asset: ParsedBlockChainAsset) => number | undefined;
}

const AspectRatioContext = createContext<AspectRatioContextType | null>(null);

export const AspectRatioProvider = ({ children }: { children: ReactNode }) => {
  const [aspectRatios, setAspectRatios] = useState<Map<string, number>>(
    new Map()
  );

  const setAspectRatio = (asset: ParsedBlockChainAsset, ratio: number) => {
    setAspectRatios((prev) => new Map(prev).set(asset.tokenAddress, ratio));
  };

  const getAspectRatio = (asset: ParsedBlockChainAsset) => {
    return aspectRatios.get(asset.tokenAddress);
  };

  return (
    <AspectRatioContext.Provider
      value={{ aspectRatios, setAspectRatio, getAspectRatio }}
    >
      {children}
    </AspectRatioContext.Provider>
  );
};

export const useAspectRatio = () => {
  const context = useContext(AspectRatioContext);
  if (!context) {
    throw new Error("useAspectRatio must be used within AspectRatioProvider");
  }
  return context;
};
