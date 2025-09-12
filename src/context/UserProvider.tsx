"use client";

import { getCsrfToken, signIn, signOut, useSession } from "next-auth/react";
import { UserType } from "@/types/user";
import {
  useContext,
  useState,
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { SignInMessage } from "@/utils/auth";
import axios from "axios";
import base58 from "bs58";
import { toast } from "sonner";
import { truncate } from "@/utils/ui-utils";
import { handleClientError } from "@/utils/handleError";
import { USER_ROUTE } from "@/constants/serverRoutes";
import { parseEntryDates } from "@/utils/timeline";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { AuthOptionsDialog } from "@/components/auth/AuthOptionsDialog";
import { activeSolanaWalletIsInUserWallets } from "@/utils/user";

type UserContextType = {
  user: UserType | null;
  setUser: Dispatch<SetStateAction<UserType | null>>;
  logInUser: () => void;
  logOutUser: () => Promise<void>;
  userLoading: boolean;
  loggedIn: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
  logInUser: () => {},
  logOutUser: async () => {},
  userLoading: false,
  loggedIn: false,
});

export const useUser = () => useContext(UserContext);

//TODO: convert to Jotai for less rerenders
const UserContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { publicKey, signMessage, disconnect } = useWallet();
  const { status, data: session } = useSession();

  const [user, setUser] = useState<UserType | null>(null);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [authOptionsOpen, setAuthOptionsOpen] = useState(false);
  const signingInRef = useRef(false);
  
  const userExists = !!user;
  const sessionIdExists = !!session?.user && !!session.user.id;

  //users with oauth accounts have an email
  const validOAuthEmail = !!user?.authUserId ? user.authUser.email : null;

  const userLoading =
    status === "loading" || (status === "authenticated" && !userExists);

  const logInUser = useCallback(() => {
    setAuthOptionsOpen(true);
  }, []);

  const logOutUser = useCallback(async () => {
    if (disconnect) {
      await disconnect();
    }

    setUser(null);
    setHasLoggedIn(false);
    signingInRef.current = false;
    signOut({ redirect: false });
  }, [disconnect]);

  const handleWalletAuthSignIn = useCallback(async () => {
    try {
      if (signingInRef.current) return;
      signingInRef.current = true;

      const csrf = await getCsrfToken();
      if (!publicKey || !csrf || !signMessage) return;

      const message = new SignInMessage({
        domain: window.location.host,
        publicKey: publicKey?.toBase58(),
        statement: `Sign this message to sign in to ${TITLE_COPY} -- `,
        nonce: csrf,
      });

      const data = new TextEncoder().encode(message.prepare());
      const signature = await signMessage(data);
      const serializedSignature = base58.encode(signature);

      const res = await signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature: serializedSignature,
      });

      if (res?.error) {
        toast.error("Failed to sign in. Please try again.");
        throw new Error(res.error);
      }
    } catch (error) {
      
      handleClientError({
        error,
        location: "useAuth_handleWalletAuthSignIn",
      });
      
      await logOutUser();
    } finally {
      signingInRef.current = false;
    }
  }, [signMessage, publicKey, logOutUser]);

  useEffect(() => {
    // wallet is connected but user is not logged in
    if (status === "unauthenticated" && publicKey) {
      handleWalletAuthSignIn();
    }
  }, [publicKey, status, handleWalletAuthSignIn]);

  useEffect(() => {
    // if auth session is authenticated but custom auth logic failed (nextAuthOptions.ts)
    if (status === "authenticated" && !sessionIdExists) {
      logOutUser(); //needed for the custom credentials auth flow
    }
  }, [status, logOutUser, sessionIdExists]);

  useEffect(() => {
    if (hasLoggedIn || !userExists) return;
    //once userExists is true check to make sure the needed info is also there (publicKey or validOAuthEmail)
    //then set hasLoggedIn to true
    if (publicKey) {
      toast.success("Logged in", {
        description: `${truncate(publicKey.toString())} is connected`,
      });
      setHasLoggedIn(true);
    } else if (validOAuthEmail) {
      toast.success("Logged in", {
        description: `${validOAuthEmail} is connected`,
      });
      setHasLoggedIn(true);
    } else {
      //auth is logged in but wallet is not connected and no oauth account
      //TODO consider fallback options
      logOutUser();
    }
  }, [publicKey, userExists, hasLoggedIn, logOutUser, validOAuthEmail]);

  useEffect(() => {
    if (userExists) return;

    if (status === "authenticated" && sessionIdExists) {
      const controller = new AbortController();

      axios
        .get<{ user: UserType }>(USER_ROUTE, { signal: controller.signal })
        .then((response) => {
          const userData = response.data.user;

          // Convert date strings back to Date objects
          if (userData.createdTimelineEntries) {
            userData.createdTimelineEntries = parseEntryDates(
              userData.createdTimelineEntries
            );
          }

          if (userData.collectedTimelineEntries) {
            userData.collectedTimelineEntries = parseEntryDates(
              userData.collectedTimelineEntries
            );
          }

          setUser(userData);
        })
        .catch((error) => {
          if (controller.signal.aborted) return;

          logOutUser();
          handleClientError({
            error,
            location: "useAuth_get(USER_ROUTE)",
          });
        });

      return () => controller.abort();
    }
  }, [logOutUser, sessionIdExists, status, userExists]);

  const contextValue = useMemo(
    () => ({
      user,
      setUser, // stable from useState
      logOutUser,
      logInUser,
      userLoading,
      loggedIn: userExists,
    }),
    [user, userLoading, userExists, logOutUser, logInUser]
  );

  useEffect(() => {
    if (!publicKey || !user) return;

    if (!activeSolanaWalletIsInUserWallets(user, publicKey)) {
      toast.info("Wallet Mismatch", {
        description: "To login with this wallet, please log out and reconnect",
      });
    }
  }, [publicKey, user]);

  return (
    <UserContext.Provider value={contextValue}>
      <AuthOptionsDialog
        open={authOptionsOpen}
        onOpenChange={setAuthOptionsOpen}
      />
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
