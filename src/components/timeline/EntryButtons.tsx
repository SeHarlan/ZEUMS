import { INTEGRATION_CONFIG } from "@/constants/integrationUrls";
import { EntryButton, Integration } from "@/types/entry";
import { cn } from "@/utils/ui-utils";
import { FC } from "react";
import { LinkButton } from "../ui/button";

interface EntryButtonsProps {
  integrations?: Integration[];
  tokenAddress?: string;
  buttons?: EntryButton[];
  className?: string;
}



const IntegrationButton: FC<{ integration: Integration; tokenAddress: string }> = ({ integration, tokenAddress }) => {
  const config = INTEGRATION_CONFIG[integration.type];

  return (
    <LinkButton
      href={config.getUrl(tokenAddress)}
      variant="default"
    >
      {config.label}
      {config.icon}
    </LinkButton>
  );
};

const EntryButtons: FC<EntryButtonsProps> = ({ buttons, className, integrations, tokenAddress }) => {
  const hasButtons = buttons && buttons.length > 0;
  const hasIntegrations = integrations && integrations.length > 0 && tokenAddress;

  if (!hasButtons && !hasIntegrations) return null;

  return (
    //Reverse so the primary button is last
    //Dont use row-reverse cause we want the primary button to drop down on wrap
    <div
      className={cn("flex justify-center gap-2 flex-wrap w-full", className)}
    >
      {hasIntegrations && integrations.map((integration) => (
        <IntegrationButton
          key={integration.type}
          integration={integration}
          tokenAddress={tokenAddress}
        />
      ))}
      {hasButtons && buttons.toReversed().map((button, index) => (
        <LinkButton
          key={index + button.text}
          href={button.url}
          variant={(!integrations?.length && index === buttons.length - 1) ? "default" : "outline"}
        >
          {button.text}
        </LinkButton>
      ))}
    </div>
  );
};

export default EntryButtons;
