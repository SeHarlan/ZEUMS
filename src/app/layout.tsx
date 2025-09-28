import type { Metadata } from "next";
import { DM_Serif_Text, DM_Sans, DM_Mono } from "next/font/google";
import AuthContextProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import WalletContextProvider from "@/context/WalletProvider";
import UserContextProvider from "@/context/UserProvider";
import NavBar from "@/components/navigation/NavBar";
import NavBarActionsProvider from "@/context/NavBarActionsProvider";
import { Analytics } from "@vercel/analytics/next";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { cn } from "@/utils/ui-utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Suspense } from "react";
import { AspectRatioProvider } from "@/context/AspectRatioProvider";
import { SUBTITLE_COPY, TITLE_COPY } from "@/textCopy/mainCopy";
import { MAIN_SCROLL_AREA_ID } from "@/constants/ui";


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
        <WalletContextProvider>
          <AuthContextProvider>
            <UserContextProvider>
              <NavBarActionsProvider>
                <AspectRatioProvider>
                  <ScrollArea className="h-screen" id={MAIN_SCROLL_AREA_ID}>
                    <Suspense fallback={<nav />}>
                      <NavBar />
                    </Suspense>
                    {children}
                    <Toaster />
                  </ScrollArea>
                </AspectRatioProvider>
              </NavBarActionsProvider>
            </UserContextProvider>
          </AuthContextProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
