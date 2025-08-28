import { FC } from "react";
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
import { ABOUT, EDIT_GALLERIES, EDIT_PROFILE, EDIT_TIMELINE, HOME } from '@/constants/clientRoutes';
import LoginButton from "../general/LoginButton"
import { cn, truncate } from "@/utils/ui-utils";
import { useUser } from "@/context/UserProvider";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { P } from "../typography/Typography";
import { useWallet } from "@solana/wallet-adapter-react";
import { TITLE_COPY } from "@/textCopy/mainCopy";

const NavMenu: FC = () => {
  const { loggedIn, user } = useUser();
  const {publicKey} = useWallet();

  const activeWallet = truncate(publicKey?.toString());

  return (
    <NavigationMenu viewportClassName="left-1/2 -translate-x-1/2">
      <NavigationMenuList >
        <NavigationMenuItem>
          <NavLink label="Z" href={HOME} className="font-serif text-3xl" />
        </NavigationMenuItem>

        <NavDropDown trigger={"Explore"}>
          <NavLink label={`About ${TITLE_COPY}`} href={ABOUT} />
          <NavLink label="Timelines" href="/placeholder" />
          <NavLink label="Galleries" href="/placeholder" />
        </NavDropDown>

        <NavDropDown trigger={"Profile"}>
          <NavLink
            label="Profile Settings"
            href={EDIT_PROFILE}
            disabled={!loggedIn}
          />
          <NavLink
            label="Edit Timeline"
            href={EDIT_TIMELINE}
            disabled={!loggedIn}
          />
          <NavLink
            label="Manage Galleries"
            href={EDIT_GALLERIES}
            disabled={!loggedIn}
          />

          <Separator className="w-full col-span-2" />

          <div className="col-span-2 w-full">
            <Button className="w-full" disabled={!loggedIn}>
              <Link href="/placeholder">Go to my timeline</Link>
            </Button>
          </div>

          <div className="w-full bg-muted rounded-md flex items-center justify-center">
            <P className="text-center text-muted-foreground text-sm">
              {user ? `${truncate(user.username)} - ${activeWallet}` : "Z"}
            </P>
          </div>
          <LoginButton variant={loggedIn ? "outline" : "default"} />
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
      <NavigationMenuTrigger>{trigger}</NavigationMenuTrigger>
      <NavigationMenuContent >
        <div className="grid grid-cols-1 md:grid-cols-2 w-[30rem] max-w-full gap-4 justify-stretch p-2">{children}</div>
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