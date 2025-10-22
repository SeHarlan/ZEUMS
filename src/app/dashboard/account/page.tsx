"use client";

import ProfileAccountForm from "@/components/dashboard/editProfile/AccountForm";
import { PageTurnRight } from "@/components/dashboard/PageTurnButtons";
import { PageContainer } from "@/components/general/PageContainer";
import { H1 } from "@/components/typography/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { EDIT_TIMELINE } from "@/constants/clientRoutes";


export default function EditProfilePage() {
  return (
    <PageContainer
      maxWidth="full"
      noPadding
    >
      <PageTurnRight path={EDIT_TIMELINE} />
      <div className="absolute-center w-full max-h-full max-w-lg px-4 py-10 overflow-y-auto">
        <Card>
          <CardContent>
            <div className="mb-6 space-y-2">
              <H1 className="lg:text-4xl">Account Settings</H1>
              <p className="text-muted-foreground">
                Manage your account information and wallets
              </p>
            </div>
            <ProfileAccountForm />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
