"use client";

import React, { FC, useEffect, useRef, useState } from 'react';

import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';

import { cn } from '@/utils/ui-utils';
import NavMenu from './NavMenu';

const INTENT_DELAY = 300; //ms

const NavBar: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<NodeJS.Timeout>(null);
  const mouseInMenuRef = useRef(false);

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

  useEffect(() => {
    // Detect when a mouse enters/leaves the top of the screen
    // and set the menu state accordingly
    let menuIntent = false;
    const intentDelay = INTENT_DELAY;

    const handleMousePosition = () => {
      const topThreshold = 80; //pxs (matches current nav menu hight plus margin)

      const isInTopArea = () => {
        return mouseY < topThreshold;
      };
      // Only update state when intent changes to avoid unnecessary renders
      if (isInTopArea() !== menuIntent && !mouseInMenuRef.current) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
          setIsMenuOpen(isInTopArea());
        }, intentDelay);

        menuIntent = isInTopArea();
      }
    };

    // Track mouse position without excessive event handling
    let mouseY = 0;
    let ticking = false;

    const updateMousePosition = (e: MouseEvent) => {
      mouseY = e.clientY;

      // Use requestAnimationFrame for better performance
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleMousePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    document.addEventListener("mousemove", updateMousePosition);
    return () => {
      document.removeEventListener("mousemove", updateMousePosition);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Ensures the menu stays open when the mouse is inside the dropdown elements
    const menuElement = menuRef.current;

    const handleMenuEnter = () => {
      mouseInMenuRef.current = true;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };

    const handleMenuLeave = () => {
      mouseInMenuRef.current = false;
    };

    // Add listeners after the menu is fully rendered
    const setupMenuListeners = () => {
      if (!menuElement || !isMenuOpen) return;

      // Add listeners to the menu and all its children
      menuElement.addEventListener("mouseenter", handleMenuEnter);
      menuElement.addEventListener("mouseleave", handleMenuLeave);
    };

    // // Set up the listeners when the menu opens
    if (isMenuOpen) {
      // Small delay to ensure elements are fully rendered
      setTimeout(setupMenuListeners, 50);
    }

    return () => {
      if (menuElement) {
        menuElement.removeEventListener("mouseenter", handleMenuEnter);
        menuElement.removeEventListener("mouseleave", handleMenuLeave);
      }
    };
  }, [isMenuOpen]); // Add isMenuOpen as a dependency

  return (
    <div className="fixed w-full top-0 left-0 h-0 z-50">
      <div
        ref={menuRef}
        className={cn(
          isMenuOpen ? "top-5 opacity-100" : "top-[-200px] opacity-0",
          "relative w-fit p-2 mx-auto z-50",
          "bg-background rounded-lg shadow-md",
          "transition-all duration-300 ease-in-out"
        )}
      >
        <NavMenu />
      </div>

      <Button
        variant={isMenuOpen ? "secondary" : "outline"}
        size="icon"
        onClick={toggleMenu}
        ref={buttonRef}
        className="absolute z-50 top-4 lg:top-8 right-4  lg:right-8"
      >
        {isMenuOpen ? <X /> : <Menu />}
      </Button>
    </div>
  );
};



export default NavBar;
