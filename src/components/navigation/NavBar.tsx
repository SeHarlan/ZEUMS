"use client";

import { Button, LinkButton } from "@/components/ui/button";
import { ArrowLeft, MenuIcon, MessageCircleQuestionIcon, XIcon } from 'lucide-react';
import { FC, useRef, useState } from 'react';

import { navBarVisibleAtom } from "@/atoms/navigation";
import { useNavBarActions } from '@/context/NavBarActionsProvider';
import { useReturnPath } from '@/hooks/useReturnPath';
import { cn } from '@/utils/ui-utils';
import { useAtom } from "jotai";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import NavMenu from './NavMenu';
import SupportDialog from './SupportDialog';

const NavBar: FC = () => {
  const [menuOpen, setMenuOpen] = useAtom(navBarVisibleAtom);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [supportOpen, setSupportOpen] = useState(false);
  const returnPath = useReturnPath();
  const { actions } = useNavBarActions();

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleSupportClick = () => { 
    setSupportOpen(true);
  }

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
          "w-fit p-1.25 pl-2 md:p-2 md:pl-3 z-100 border bg-popover",
          "rounded-sm shadow-md",
          "transition-all duration-400 ease-in-out",
          "relative left-1/2 -translate-x-1/2",
          "fill-mode-forwards zoom-in-90 fade-in-0 zoom-out-90 fade-out-0",
          menuOpen ? "top-2 animate-in " : "-top-[14vh] animate-out ",
          "md:top-4 lg:top-6 "
        )}
      >
        <NavMenu />
      </div>

      {/* Menu Button - Right side */}
      <div
        className={cn(
          "flex flex-col-reverse md:flex-row  items-end gap-3 fixed z-90 right-4 lg:right-8",
          "top-4 lg:top-8 overflow-hidden"
        )}
      >
        <div
          className={cn(
            "relative flex flex-col-reverse md:flex-row flex-wrap items-end md:items-center gap-3 duration-400",
            "fill-mode-forwards zoom-in-80 fade-in-0 zoom-out-80 fade-out-0",
            menuOpen
              ? "top-0 right-0 animate-in "
              : "right-0 md:-right-full -top-36 md:top-0 animate-out pointer-events-none"
          )}
        >
          {actions}

          <Button
            onClick={handleSupportClick}
            size="icon"
            variant="outline"
            className="size-10"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <MessageCircleQuestionIcon className="size-6" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Need help?
              </TooltipContent>
            </Tooltip>
          </Button>
        </div>

        <Button
          variant={"outline"}
          size="icon"
          onClick={toggleMenu}
          ref={buttonRef}
          className="size-10 z-20"
        >
          {menuOpen ? (
            <XIcon className="size-5.5" />
          ) : (
            <MenuIcon className="size-5" />
          )}
        </Button>
      </div>
      <SupportDialog open={supportOpen} onOpenChange={setSupportOpen} />
    </div>
  );
};

export default NavBar;
