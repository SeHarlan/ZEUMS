import { FC } from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { EntryFormValues } from "@/forms/upsertEntry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { P } from "../typography/Typography";

interface ButtonEditorProps {
  form: UseFormReturn<EntryFormValues>;
}

const ButtonEditor: FC<ButtonEditorProps> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <P className="text-sm font-medium">Buttons</P>
        <Button
          type="button"
          variant={!fields.length ? "default" : "outline"}
          size="sm"
          onClick={addButton}
          disabled={fields.length >= 3}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Button
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Add up to 3 buttons to your entry (optional)
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 items-start">
              <FormField
                control={form.control}
                name={`buttons.${index}.text`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Button Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Button text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`buttons.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">URL</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="example.com" {...field} />
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