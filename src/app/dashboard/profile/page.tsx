"use client";

import { PageContainer } from "@/components/general/PageContainer";
import PageHeading from "@/components/general/PageHeading";
import ProfileAccountForm from "@/components/dashboard/editProfile/AccountForm";
import ProfileDisplayForm from "@/components/dashboard/editProfile/DisplayForm";
import { PageTurnLeft, PageTurnRight } from "@/components/dashboard/PageTurnButtons";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EDIT_TIMELINE } from "@/constants/clientRoutes";
import { EditProfileTab, EditProfileTabQueryParam, isEditProfileTab } from "@/types/ui/dashboard";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";


export default function EditProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<EditProfileTab>(EditProfileTab.DISPLAY);
  
  // Set active tab based on URL query param
  useEffect(() => {
    const tab = searchParams.get(EditProfileTabQueryParam);
    if (isEditProfileTab(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    //update the url query param

    // type guard to ensure value is EditProfileTab
    if (isEditProfileTab(value)) {
      setActiveTab(value);

      // Update URL query parameter using modern Next.js 15 approach
      const params = new URLSearchParams(searchParams);
      params.set(EditProfileTabQueryParam, value);

      // Use router.replace with scroll: false for better UX
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <PageContainer maxWidth="small">
      <PageHeading
        title="Profile"
        subtitle="Edit your profile information and manage wallets"
      />
      {activeTab === EditProfileTab.DISPLAY ? (
        <PageTurnLeft
          useOnClick={true}
          onClick={() => handleTabChange(EditProfileTab.ACCOUNT)}
          path={""}
        />
      ) : null}
      <PageTurnRight
        useOnClick={activeTab === EditProfileTab.ACCOUNT}
        onClick={() => handleTabChange(EditProfileTab.DISPLAY)}
        path={EDIT_TIMELINE}
      />

      <Card>
        <CardContent>
          <Tabs
            defaultValue={EditProfileTab.DISPLAY}
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="w-full justify-stretch h-fit flex-wrap">
              <TabsTrigger value={EditProfileTab.ACCOUNT}>
                Account Details
              </TabsTrigger>
              <TabsTrigger value={EditProfileTab.DISPLAY}>
                Display Information
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value={EditProfileTab.ACCOUNT}
              className="flex flex-col space-y-8 mt-8"
            >
              <ProfileAccountForm />
            </TabsContent>
            <TabsContent
              value={EditProfileTab.DISPLAY}
              className="flex flex-col space-y-8 mt-8"
            >
              <ProfileDisplayForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
