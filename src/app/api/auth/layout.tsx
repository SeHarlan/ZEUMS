import Logo from "@/components/general/Logo";
import { PageContainer } from "@/components/general/PageContainer";
import { Card, CardDescription, CardTitle, CardHeader, CardContent } from "@/components/ui/card";
import { TITLE_COPY } from "@/textCopy/mainCopy";
import { Suspense } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageContainer
      className="min-h-screen flex items-center justify-center bg-secondary"
      maxWidth="full"
    >
      <Suspense
        fallback={
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="text-xl">{TITLE_COPY}</CardTitle>
              <CardDescription className="text-muted-foreground">
                Loading page...
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Logo />
            </CardContent>
          </Card>
        }
      >
        {children}
      </Suspense>
    </PageContainer>
  );
}
