"use client";

import { FormControl, FormDescription, FormField, FormItem } from "@/components/ui/form";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import FontPickerDialog from "@/components/fonts/FontPickerDialog";

interface GoogleFontPickerProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  description?: string;
}

function GoogleFontPicker<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
}: GoogleFontPickerProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <FontPickerDialog
              value={field.value || ""}
              onChange={field.onChange}
              label={label}
              description={description}
            />
          </FormControl>
          {!description && <FormDescription className="sr-only">{label}</FormDescription>}
        </FormItem>
      )}
    />
  );
}

export default GoogleFontPicker;
