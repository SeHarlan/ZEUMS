"use client";

import FontPickerDialog from "@/components/fonts/FontPickerDialog";
import FontPickerInline from "@/components/fonts/FontPickerInline";
import { FormControl, FormDescription, FormField, FormItem } from "@/components/ui/form";
import { useBreakpoints } from "@/context/ResponsiveProvider";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export const DEFAULT_HEADING_FONT = "DM Serif Text";
export const DEFAULT_BODY_FONT = "DM Sans";

interface GoogleFontPickerProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  description?: string;
  defaultFont?: string;
}

function GoogleFontPicker<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  defaultFont,
}: GoogleFontPickerProps<TFieldValues>) {
  const { isSm } = useBreakpoints();
  const resolvedDefault = defaultFont ?? (
    /heading/i.test(label) ? DEFAULT_HEADING_FONT : DEFAULT_BODY_FONT
  );

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            {isSm ? (
              <FontPickerDialog
                value={field.value || ""}
                onChange={field.onChange}
                label={label}
                description={description}
                defaultFont={resolvedDefault}
              />
            ) : (
              <FontPickerInline
                value={field.value || ""}
                onChange={field.onChange}
                label={label}
                description={description}
                defaultFont={resolvedDefault}
              />
            )}
          </FormControl>
          {!description && <FormDescription className="sr-only">{label}</FormDescription>}
        </FormItem>
      )}
    />
  );
}

export default GoogleFontPicker;
