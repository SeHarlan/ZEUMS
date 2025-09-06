import Logo from "@/components/general/Logo";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Logo className="absolute-center size-16" />}>
      {children}
    </Suspense>
  );
}