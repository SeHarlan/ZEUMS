"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type NavBarActionsContextValue = {
  actions: React.ReactNode | null;
  setActions: (node: React.ReactNode | null) => void;
};

const NavBarActionsContext = createContext<NavBarActionsContextValue | undefined>(undefined);

const NavBarActionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actions, setActions] = useState<React.ReactNode | null>(null);

  const value = useMemo(
    () => ({ actions, setActions }),
    [actions]
  );

  return (
    <NavBarActionsContext.Provider value={value}>{children}</NavBarActionsContext.Provider>
  );
};

export default NavBarActionsProvider;

export const useNavBarActions = (): { actions: React.ReactNode | null } => {
  const ctx = useContext(NavBarActionsContext);
  if (!ctx) throw new Error("useNavBarActions must be used within NavBarActionsProvider");
  return { actions: ctx.actions };
};

export const useSetNavBarActions = () => {
  const ctx = useContext(NavBarActionsContext);
  if (!ctx) throw new Error("useSetNavBarActions must be used within NavBarActionsProvider");
  return ctx.setActions;
};

export const NavBarActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const setActions = useSetNavBarActions();
  const [isMounted, setIsMounted] = useState(false);

  //only setActions once mounted to avoid hydration errors
  useEffect(() => { 
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    setActions(children);
    return () => setActions(null);
  }, [children, setActions, isMounted]);

  return null;
};


