import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusIcon, Trash2 } from "lucide-react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { P } from "../typography/Typography";
import { Badge } from "../ui/badge";


type FormWithButtons = {
  buttons: {
    text: string;
    url: string;
  }[];
};
interface ButtonEditorProps<T extends FormWithButtons> {
  form: UseFormReturn<T>;
}

const ButtonEditor = <T extends FormWithButtons>({
  form,
}: ButtonEditorProps<T>) => {
  //Needs type coercion for TS to get the correct ArrayPath type as "buttons"
  //We can be certain the form thats passed has at least the correct buttons field because T extends FormWithButtons
  const { control } = form as unknown as UseFormReturn<FormWithButtons>;

  const { fields, append, remove } = useFieldArray({
    control: control,
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

  return (
    <div>
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