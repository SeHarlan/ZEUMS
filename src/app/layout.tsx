import NavBar from "@/components/navigation/NavBar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toaster } from "@/components/ui/sonner";
import { MAIN_SCROLL_AREA_ID } from "@/constants/ui";
import { AspectRatioProvider } from "@/context/AspectRatioProvider";
import AuthContextProvider from "@/context/AuthProvider";
import NavBarActionsProvider from "@/context/NavBarActionsProvider";
import { ResponsiveProvider } from "@/context/ResponsiveProvider";
import UserContextProvider from "@/context/UserProvider";
import WalletContextProvider from "@/context/WalletProvider";
import { SUBTITLE_COPY, TITLE_COPY } from "@/textCopy/mainCopy";
import { cn } from "@/utils/ui-utils";
import "@solana/wallet-adapter-react-ui/styles.css";
import { Analytics } from "@vercel/analytics/next";
import { Provider as AtomProvider } from "jotai";
import type { Metadata } from "next";
import { DM_Mono, DM_Sans, DM_Serif_Text } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";


const dmSerif = DM_Serif_Text({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: "400",
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});


export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://www.zeums.art"),
  title: TITLE_COPY,
  description: SUBTITLE_COPY,
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: TITLE_COPY,
    description: SUBTITLE_COPY,
    url: "https://www.zeums.art",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${TITLE_COPY} - ${SUBTITLE_COPY}`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE_COPY,
    description: SUBTITLE_COPY,
    images: ["/og-image.png"],
    creator: "@ZEUMS_art",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          dmSans.variable,
          dmMono.variable,
          dmSerif.variable,
          "antialiased font-sans"
        )}
      >
        <Analytics />
        <AtomProvider>
        <WalletContextProvider>
          <AuthContextProvider>
            <UserContextProvider>
              <ResponsiveProvider>
                <NavBarActionsProvider>
                  <AspectRatioProvider>
                    <Suspense fallback={<nav />}>
                      <NavBar />
                    </Suspense>
                    <ScrollArea className="h-screen" id={MAIN_SCROLL_AREA_ID}>
                      {children}
                    </ScrollArea>
                  </AspectRatioProvider>
                </NavBarActionsProvider>
              </ResponsiveProvider>
            </UserContextProvider>
          </AuthContextProvider>
          </WalletContextProvider>
        </AtomProvider>
        <Toaster
          position="bottom-right"
          richColors={true}
          closeButton={true}
        />
      </body>
    </html>
  );
}
