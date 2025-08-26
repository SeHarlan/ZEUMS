import type { Metadata } from "next";
import { DM_Serif_Text, DM_Sans, DM_Mono } from "next/font/google";
import AuthContextProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import WalletContextProvider from "@/context/WalletProvider";
import UserContextProvider from "@/context/UserProvider";
import NavBar from "@/components/navBar/NavBar";

import "@solana/wallet-adapter-react-ui/styles.css";
import "./globals.css";
import { cn } from "@/utils/ui-utils";
import { ScrollArea } from "@/components/ui/scroll-area";


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
  title: "Zeums",
  description: "Celebrate your digital history",
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
        <WalletContextProvider>
          <AuthContextProvider>
            <UserContextProvider>
              <ScrollArea className="h-screen">
                <NavBar />
                <main className="container mx-auto py-8 px-8">{children}</main>
                <Toaster />
              </ScrollArea>
            </UserContextProvider>
          </AuthContextProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
