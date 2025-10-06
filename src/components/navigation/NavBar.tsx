"use client";

import React, { FC, useEffect, useRef, useState } from 'react';
import { Button, LinkButton } from "@/components/ui/button";
import { MenuIcon, XIcon, ArrowLeft, MessageCircleQuestionIcon } from 'lucide-react';

import { cn } from '@/utils/ui-utils';
import NavMenu from './NavMenu';
import { useReturnPath } from '@/hooks/useReturnPath';
import { useNavBarActions } from '@/context/NavBarActionsProvider';
import SupportDialog from './SupportDialog';

const NavBar: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const returnPath = useReturnPath();
  const { actions } = useNavBarActions();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSupportClick = () => { 
    setSupportOpen(true);
  }

  useEffect(() => {
    // Close the menu when the user clicks outside of it
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const menu = menuRef.current;
      const button = buttonRef.current;
      if (!menu?.contains(target) && !button?.contains(target)) {
        setMenuOpen(false);
      } else {
        event.preventDefault();
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
          className={cn(
            "fixed z-100 left-4 lg:left-8 top-4 lg:top-8 size-12 md:size-10"
          )}
        >
          <ArrowLeft className="size-5" />
        </LinkButton>
      )}

      <div
        ref={menuRef}
        className={cn(
          "w-fit p-1.25 pl-2 md:p-2 md:pl-3 z-100 border bg-popover",
          "rounded-sm shadow-md",
          "transition-all duration-400 ease-in-out",
          "relative left-1/2 -translate-x-1/2",
          "fill-mode-forwards zoom-in-90 fade-in-0 zoom-out-90 fade-out-0",
          menuOpen ? "top-4 animate-in " : "-top-[14vh] animate-out ",
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
        {/* {actions && ( */}
        <div
          className={cn(
            "relative flex flex-col md:flex-row items-end md:items-center gap-3 duration-400 ease-in-out",
            "fill-mode-forwards zoom-in-90 fade-in-0 zoom-out-90 fade-out-0",
            menuOpen ? "right-0 animate-in " : "-right-[200%] animate-out",
            "md:right-0 md:hover:animate-in"
          )}
        >
          {actions}
          <Button
            onClick={handleSupportClick}
            size="icon"
            variant="outline"
            className="size-12 md:size-10"
          >
            <MessageCircleQuestionIcon className="size-6" />
          </Button>
        </div>
        {/* )} */}

        <Button
          variant={"outline"}
          size="icon"
          onClick={toggleMenu}
          ref={buttonRef}
          className="size-12 md:size-10"
        >
          {menuOpen ? (
            <XIcon className="size-5.5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </Button>
      </div>

      {/* <div
        className={cn(
          "fixed z-90 right-4 lg:right-8 bottom-4 lg:bottom-8",
          "flex flex-col md:flex-row items-end md:items-center gap-3 duration-400 ease-in-out",
          "fill-mode-forwards zoom-in-90 fade-in-0 zoom-out-90 fade-out-0",
          menuOpen
            ? "right-4 lg:right-8 animate-in "
            : "-right-[200%] animate-out",
          "md:hover:animate-in"
        )}
      >
        <Button
          onClick={handleSupportClick}
          size="icon"
          variant="outline"
          className="size-12 md:size-10"
        >
          <MessageCircleQuestionIcon className="size-6" />
        </Button>
      </div> */}

      <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  );
};

export default NavBar;
