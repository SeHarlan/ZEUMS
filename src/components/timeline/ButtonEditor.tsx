import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { INTEGRATION_CONFIG } from "@/constants/integrationUrls";
import { Integration } from "@/types/entry";
import { cn } from "@/utils/ui-utils";
import { CheckIcon, PlusIcon, Trash2 } from "lucide-react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { P } from "../typography/Typography";
import { Badge } from "../ui/badge";


type FormWithButtons = {
  buttons: {
    text: string;
    url: string;
  }[];
  integrations?: Integration[];
};
interface ButtonEditorProps<T extends FormWithButtons> {
  form: UseFormReturn<T>;
  tokenAddress?: string;
}

const IntegrationToggleButton = ({
  label,
  isActive,
  onClick,
  icon,
  }: {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Button
    type="button"
    variant="secondary"
    size="sm"
    onClick={onClick}
    className="flex-1 hover:opacity-80"
  >
    {label} {icon}
    <CheckIcon className={cn("size-4", isActive ? "opacity-100" : "opacity-10")} /> 
  </Button>
);

const ButtonEditor = <T extends FormWithButtons>({
  form,
  tokenAddress,
}: ButtonEditorProps<T>) => {
  //Needs type coercion for TS to get the correct ArrayPath type as "buttons" and "integrations"
  //We can be certain the form thats passed has at least the correct fields because T extends FormWithButtons
  const { control, watch, setValue } = form as unknown as UseFormReturn<FormWithButtons>;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "buttons",
  });

  const addButton = () => {
    if (fields.length < 3) {
      append({ text: "", url: "" });
    }
  };

  const removeButton = (index: number) => {
    remove(index);
  };

  const integrations = watch("integrations") || [];

  const toggleIntegration = (type: Integration["type"]) => {
    const existing = integrations.find((i) => i.type === type);
    if (existing) {
      setValue(
        "integrations",
        integrations.filter((i) => i.type !== type)
      );
    } else {
      setValue("integrations", [
        ...integrations,
        { type, action: "link" },
      ]);
    }
  };

  const hasMallow = integrations.some((i) => i.type === "mallow");
  const hasExchange = integrations.some((i) => i.type === "exchange");

  return (
    <div>
      {tokenAddress && (
        <div className="mb-4">
          <P className="text-sm font-medium mb-2">Integrations</P>
          <div className="flex gap-2">
            <IntegrationToggleButton
              label="Link to Mallow"
              isActive={hasMallow}
              onClick={() => toggleIntegration("mallow")}
              icon={INTEGRATION_CONFIG.mallow.icon}
            />
            <IntegrationToggleButton
              label="Link to Exchange"
              isActive={hasExchange}
              onClick={() => toggleIntegration("exchange")}
              icon={INTEGRATION_CONFIG.exchange.icon}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <P className="text-sm font-medium">Buttons</P>
        <Button
          type="button"
          variant={!fields.length ? "default" : "outline"}
          size="sm"
          onClick={addButton}
          disabled={fields.length >= 3}
        >
          Add Button
          <PlusIcon />
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add up to 3 buttons that link to external sites.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
              <FormField
                control={control}
                name={`buttons.${index}.text`}
                render={({ field }) => (
                  <FormItem className="gap-1">
                    <FormLabel asChild>
                      <Badge
                        variant={index === 0 ? "default" : "outline"}
                        className="text-xs"
                      >
                        Button Text
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Button text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`buttons.${index}.url`}
                render={({ field }) => (
                  <FormItem className="gap-1">
                    <FormLabel asChild>
                      <Badge
                        variant="outline"
                        className="text-xs border-transparent pl-0"
                      >
                        Url
                      </Badge>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeButton(index)}
              className="mt-6 p-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {fields.length == 3 && (
          <p className="text-xs text-muted-foreground">
            Maximum of 3 buttons allowed
          </p>
        )}
      </div>
    </div>
  );
};

export default ButtonEditor;