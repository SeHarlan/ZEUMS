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
          className={cn("fixed z-100 left-4 lg:left-8 top-4 lg:top-8 size-10")}
        >
          <ArrowLeft className="size-5" />
        </LinkButton>
      )}

      <div
        ref={menuRef}
        className={cn(
          "w-fit p-0.25 lg:p-2 pl-1 lg:pl-2.5 z-100 border bg-popover",
          "rounded-sm shadow-md",
          "transition-all duration-400 ease-in-out",
          "relative left-1/2 -translate-x-1/2",

          "fill-mode-forwards zoom-in-90 fade-in-0 zoom-out-90 fade-out-0",
          isMenuOpen ? "top-4 animate-in " : "-top-[15vh] animate-out ",
          "md:top-4 lg:top-6 md:hover:animate-in"
        )}
      >
        <NavMenu />
      </div>

      {/* Menu Button - Right side */}
      <div
        className={cn(
          "flex flex-col-reverse md:flex-row items-end gap-3 fixed z-90 right-4 lg:right-8",
          "top-4 lg:top-8"
        )}
      >
        {actions && (
          <div
            className={cn(
              "relative flex flex-col md:flex-row items-end md:items-center gap-3 duration-400 ease-in-out",
              "fill-mode-forwards zoom-in-90 fade-in-0 zoom-out-90 fade-out-0",
              isMenuOpen ? "right-0 animate-in " : "-right-[200%] animate-out",
              "md:right-0 md:hover:animate-in"
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
          className="size-10"
        >
          {isMenuOpen ? (
            <XIcon className="size-5.5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default NavBar;
