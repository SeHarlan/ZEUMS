"use client";

import React, { FC, useEffect, useRef, useState } from 'react';
import { Button, LinkButton } from "@/components/ui/button";
import { MenuIcon, XIcon, ArrowLeft } from 'lucide-react';

import { cn } from '@/utils/ui-utils';
import NavMenu from './NavMenu';
import { useReturnPath } from '@/hooks/useReturnPath';
import { useNavBarActions } from '@/context/NavBarActionsProvider';

const NavBar: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const returnPath = useReturnPath();
  const { actions } = useNavBarActions();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    // Close the menu when the user clicks outside of it
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const menu = menuRef.current;
      const button = buttonRef.current;
      if (!menu?.contains(target) && !button?.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="group/nav-bar fixed w-full h-0 top-0 left-0 z-50">
      {/* Back Button - Left side */}
      {returnPath && (
        <LinkButton
          href={returnPath}
          variant="outline"
          size="icon"
          className={cn("fixed z-100 left-4 lg:left-8 ", "top-4 lg:top-8")}
        >
          <ArrowLeft />
        </LinkButton>
      )}

      <div
        ref={menuRef}
        className={cn(
          "w-fit pl-2 md:py-2 md:px-3 z-100",
          "bg-background rounded-md shadow-md",
          "transition-all duration-400 ease-in-out",
          "relative left-1/2 -translate-x-1/2",
          "top-4 lg:top-6 opacity-0 hover:opacity-100",
          isMenuOpen && "opacity-100"
        )}
      >
        <NavMenu />
      </div>

      {/* Menu Button - Right side */}
      <div
        className={cn(
          "flex flex-col-reverse md:flex-row items-end gap-4 fixed z-90 right-4 lg:right-8",
          "top-4 lg:top-8"
        )}
      >
        {actions && (
          <div
            className={cn(
              "flex flex-col md:flex-row items-end md:items-center gap-4 opacity-0 duration-300 ease-in-out hover:opacity-100",
              isMenuOpen && "opacity-100"
            )}
          >
            {actions}
          </div>
        )}

        <Button
          variant={"outline"}
          size="icon"
          onClick={toggleMenu}
          ref={buttonRef}
        >
          {isMenuOpen ? <XIcon /> : <MenuIcon />}
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
