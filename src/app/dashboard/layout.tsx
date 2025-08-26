import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// This layout component wraps the dashboard pages with a ProtectedRoute to ensure that only authenticated users can access them.
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}