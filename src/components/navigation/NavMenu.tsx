import { Button, LinkButton } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { ABOUT, EDIT_GALLERIES, EDIT_PROFILE_ACCOUNT, EDIT_TIMELINE, GALLERIES, HOME, NOT_FOUND, TIMELINES, USER_TIMELINE } from '@/constants/clientRoutes';
import { useUser } from "@/context/UserProvider";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { cn, truncate } from "@/utils/ui-utils";
import { activeSolanaWalletIsInUserWallets } from "@/utils/user";
import { useWallet } from "@solana/wallet-adapter-react";
import { InfoIcon } from "lucide-react";
import Link from 'next/link';
import { FC, useState } from "react";
import SearchAssetDialog from "../assets/SearchAssetDialog";
import LoginButton from "../general/LoginButton";
import Logo from "../general/Logo";
import { P } from "../typography/Typography";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const NavMenu: FC = () => {
  const { loggedIn, user } = useUser();
  const { publicKey } = useWallet();

  const [searchAssetOpen, setSearchAssetOpen] = useState(false);
  const activeWallet = truncate(publicKey?.toString());

  const userNameIsWalletAddress = user?.username === publicKey?.toString();

  const userDisplayName = userNameIsWalletAddress ? (
    <P>{activeWallet}</P>
  ) : (
    <P>
      {truncate(user?.username)}
      {activeWallet && <span className="text-xs italic"> - {activeWallet}</span>}
    </P>
  );

  const walletMismatch = user && publicKey && !activeSolanaWalletIsInUserWallets(user, publicKey);

  const noUserDisplayName = <P className="font-serif">Z</P>;

  return (
    <NavigationMenu viewportClassName="left-1/2 -translate-x-1/2 max-w-[calc(100vw-2rem)] translate-y-2">
      <SearchAssetDialog
        open={searchAssetOpen}
        onOpenChange={setSearchAssetOpen}
      />

      <NavigationMenuList className="gap-0 md:gap-1">
        <NavigationMenuItem className="size-9">
          <LinkButton
            href={HOME}
            size="icon"
            variant="link"
            className="size-full overflow-hidden"
          >
            <Logo className="size-full" />
          </LinkButton>
        </NavigationMenuItem>

        <NavDropDown trigger={"Explore"}>
          <NavLink label={`About ${TITLE_COPY}`} href={ABOUT} />
          <Button
            variant="ghost"
            className={cn("w-full")}
            onClick={() => setSearchAssetOpen(true)}
          >
            Search Artworks
          </Button>
          <NavLink label="Timelines" href={TIMELINES} />
          <NavLink label="Galleries" href={GALLERIES} />
        </NavDropDown>

        <NavDropDown trigger={"Manage"}>
          <NavLink
            label="Account Settings"
            href={EDIT_PROFILE_ACCOUNT}
            disabled={!loggedIn}
            className="order-1"
          />
          <NavLink
            label="My Timeline"
            href={EDIT_TIMELINE}
            disabled={!loggedIn}
            className="order-2"
          />
          <NavLink
            label="My Galleries"
            href={EDIT_GALLERIES}
            disabled={!loggedIn}
            className="order-3"
          />

          <Separator className="w-full md:col-span-2 order-4" />

          <NavigationMenuLink asChild>
            <LinkButton
              href={user?.username ? USER_TIMELINE(user.username) : NOT_FOUND}
              className="md:col-span-2 w-full order-5"
              disabled={!loggedIn}
            >
              Go to my timeline
            </LinkButton>
          </NavigationMenuLink>

          <LoginButton
            className="order-6 md:order-7"
            variant={loggedIn ? "outline" : "default"}
          />

          <NavigationMenuLink asChild>
            <Button
              className={cn(
                "order-7 md:order-6 flex-row cursor-auto",
                !loggedIn && "font-serif" //for default Z when no user
              )}
              variant="secondary"
            >
              {loggedIn ? userDisplayName : noUserDisplayName}

              {walletMismatch && (
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="size-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <P>
                      You are currently connected to a wallet not associated
                      with your account
                    </P>
                  </TooltipContent>
                </Tooltip>
              )}
            </Button>
          </NavigationMenuLink>
        </NavDropDown>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default NavMenu;

interface NavDropDownProps {
  children: React.ReactNode;
  trigger: React.ReactNode;
}
const NavDropDown: FC<NavDropDownProps> = ({ children, trigger }) => { 
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="rounded-sm text-md px-2 md:px-4">
        {trigger}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div
          className="grid grid-cols-1 md:grid-cols-2 w-[30rem] max-w-full gap-4 justify-stretch p-2"
        >
          {children}
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
}

interface NavLinkProps {
  href: string;
  label: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}
const NavLink: FC<NavLinkProps> = ({ href, label, className, disabled, onClick }) => {
  return (
    <Link
      href={href}
      passHref
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={disabled ? "pointer-events-none" : ""}
      onClick={onClick}
    >
      <NavigationMenuLink
        // with "asChild" these classNames will be passed down.
        // classNames added directly to the child tag will be overwritten
        className={cn(
          navigationMenuTriggerStyle(),
          "w-full",
          className,
          disabled && "bg-accent opacity-50"
        )}
        asChild
      >
        <P>{label}</P>
      </NavigationMenuLink>
    </Link>
  );
};