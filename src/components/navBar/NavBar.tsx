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

  // useEffect(() => {
  //   const intentDelay = INTENT_DELAY;
  //   const topThreshold = TOP_THRESHOLD;

  //   // Detect when a mouse enters/leaves the top of the screen
  //   // and set the menu state accordingly
  //   let menuIntent = false;
  //   let mouseY = 0;
  //   let ticking = false;

  //   const isInTopArea = () => mouseY < topThreshold;

  //   const handleMousePosition = () => {
  //     console.log("🚀 ~ GOT TO IT handleMousePosition ~ mouseY:", mouseY)
  //     // Only update state when intent changes to avoid unnecessary renders
  //     if (isInTopArea() !== menuIntent && !mouseInMenuRef.current) {
  //       if (timerRef.current) {
  //         clearTimeout(timerRef.current);
  //       }

  //       timerRef.current = setTimeout(() => {
  //         setIsMenuOpen(isInTopArea());
  //       }, intentDelay);

  //       menuIntent = isInTopArea();
  //     }
  //   };

  //   // Track mouse position without excessive event handling
  //   const updateMousePosition = (e: MouseEvent) => {
  //     mouseY = e.clientY;
  //     console.log("🚀 ~ updateMousePosition ~ mouseY:", mouseY)
      
  //     // Use requestAnimationFrame for better performance
  //     if (!ticking) {
  //       console.log("🚀 ~ updateMousePosition ~ e:", e)
  //       window.requestAnimationFrame(() => {
  //         handleMousePosition();
  //         ticking = false;
  //       });
  //       ticking = true;
  //     }
  //   };

  //   document.addEventListener("mousemove", updateMousePosition);
  //   return () => {
  //     document.removeEventListener("mousemove", updateMousePosition);

  //     if (timerRef.current) {
  //       clearTimeout(timerRef.current);
  //     }
  //   };
  // }, []);

  // useEffect(() => {
  //   // Ensures the menu stays open when the mouse is inside the dropdown elements
  //   const menuElement = menuRef.current;

  //   const handleMenuEnter = () => {
  //     mouseInMenuRef.current = true;
  //     if (timerRef.current) {
  //       clearTimeout(timerRef.current);
  //     }
  //   };

  //   const handleMenuLeave = () => {
  //     mouseInMenuRef.current = false;
  //   };

  //   // Add listeners after the menu is fully rendered
  //   const setupMenuListeners = () => {
  //     if (!menuElement || !isMenuOpen) return;

  //     // Add listeners to the menu and all its children
  //     menuElement.addEventListener("mouseenter", handleMenuEnter);
  //     menuElement.addEventListener("mouseleave", handleMenuLeave);
  //   };

  //   // // Set up the listeners when the menu opens
  //   if (isMenuOpen) {
  //     setTimeout(setupMenuListeners, SETUP_DELAY);
  //   }

  //   return () => {
  //     if (menuElement) {
  //       menuElement.removeEventListener("mouseenter", handleMenuEnter);
  //       menuElement.removeEventListener("mouseleave", handleMenuLeave);
  //     }
  //   };
  // }, [isMenuOpen]); // Add isMenuOpen as a dependency

  return (
    <div className="group/nav-bar fixed w-full h-0 top-0 left-0 z-50">
      {/* Back Button - Left side */}
      {returnPath && (
        <LinkButton
          href={returnPath}
          variant="outline"
          size="icon"
          className={cn(
            "fixed z-100 left-4 lg:left-8 ",
            "top-4 lg:top-8"
          )}
        >
          <ArrowLeft />
        </LinkButton>
      )}

      <div
        ref={menuRef}
        className={cn(
          "w-fit p-2 z-100",
          "bg-background rounded-md shadow-md",
          "transition-all duration-400 ease-in-out",
          "relative left-1/2 -translate-x-1/2",
          "top-2 lg:top-6 opacity-0 hover:opacity-100",
          isMenuOpen && "opacity-100"
        )}
      >
        <NavMenu />
      </div>

      {/* Menu Button - Right side */}
      <div
        className={cn(
          "flex gap-4 fixed z-90 right-4 lg:right-8",
          "top-4 lg:top-8"
        )}
      >
        {actions && (
          <div className={cn("flex items-center gap-4 opacity-0 duration-300 ease-in-out hover:opacity-100", isMenuOpen && "opacity-100")}>
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
