import { FC, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from 'next/link';
import { ABOUT, COMING_SOON, EDIT_GALLERIES,  EDIT_PROFILE_ACCOUNT, EDIT_PROFILE_DISPLAY, EDIT_TIMELINE, HOME } from '@/constants/clientRoutes';
import LoginButton from "../general/LoginButton"
import { cn, truncate } from "@/utils/ui-utils";
import { useUser } from "@/context/UserProvider";
import { Separator } from "@/components/ui/separator";
import { Button, LinkButton } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import SearchAssetDialog from "../assets/SearchAssetDialog";
import { P } from "../typography/Typography";
import Logo from "../general/Logo";
import { activeSolanaWalletIsInUserWallets } from "@/utils/user";
import { InfoIcon } from "lucide-react";
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
          <LinkButton href={HOME} size="icon" variant="link" className="size-fit overflow-hidden">
            <Logo  className="size-fit" />
          </LinkButton>
        </NavigationMenuItem>

        <NavDropDown trigger={"Explore"}>
          <NavLink label={`About ${TITLE_COPY}`} href={ABOUT} />
          <Button
            variant="ghost"
            className={cn("w-full")}
            onClick={() => setSearchAssetOpen(true)}
          >
            Search Assets
          </Button>
          <NavLink label="Timelines" disabled href={COMING_SOON} />
          <NavLink label="Galleries" disabled href={COMING_SOON} />
        </NavDropDown>

        <NavDropDown trigger={"Profile"}>
          <NavLink
            label="Profile Settings"
            href={EDIT_PROFILE_DISPLAY}
            disabled={!loggedIn}
            className="order-1"
          />
          <NavLink
            label="Edit Timeline"
            href={EDIT_TIMELINE}
            disabled={!loggedIn}
            className="order-2"
          />
          <NavLink
            label="Manage Galleries"
            href={EDIT_GALLERIES}
            disabled={!loggedIn}
            className="order-3"
          />

          <Separator className="w-full md:col-span-2 order-4" />

          <LinkButton
            href={COMING_SOON}
            className="md:col-span-2 w-full order-5"
            disabled
          >
            Go to my timeline
          </LinkButton>

          <LoginButton
            className="order-6 md:order-7"
            variant={loggedIn ? "outline" : "default"}
          />

          <LinkButton
            href={EDIT_PROFILE_ACCOUNT}
            className={cn(
              "order-7 md:order-6",
              !loggedIn && "font-serif" //for default Z when no user
            )}
            variant="secondary"
            disabled={!loggedIn}
          >
            {loggedIn ? userDisplayName : noUserDisplayName}
            
            {walletMismatch && (
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <P>You are currently connected to a wallet not associated with your account</P>
                </TooltipContent>
              </Tooltip>
            )}
          </LinkButton>
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
const NavDropDown: FC<NavDropDownProps> = ({ children, trigger}) => { 
  return (
    <NavigationMenuItem>
      <NavigationMenuTrigger className="rounded-sm text-md px-2 md:px-4">
        {trigger}
      </NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid grid-cols-1 md:grid-cols-2 w-[30rem] max-w-full gap-4 justify-stretch p-2">
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
}
const NavLink: FC<NavLinkProps> = ({ href, label, className, disabled }) => {
  return (
    <Link
      href={href}
      passHref
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : undefined}
      className={disabled ? "pointer-events-none" : ""}
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
        <p>{label}</p>
      </NavigationMenuLink>
    </Link>
  );
};