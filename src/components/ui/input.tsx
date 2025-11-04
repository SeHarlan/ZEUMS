import * as React from "react";

import { cn } from "@/utils/ui-utils";
import { ReactNode } from "react";
import { P } from "../typography/Typography";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

interface PrefixInputProps extends React.ComponentProps<"input"> {
  prefix?: string ; 
  icon?: ReactNode;
  wrapperClassName?: string;
}

function PrefixInput({
  className,
  type,
  prefix,
  icon,
  wrapperClassName,
  ...props
}: PrefixInputProps) {
  return (
    <div
      className={cn(
        "group/input-wrapper relative flex h-9 w-full rounded-md border bg-transparent transition-[color,box-shadow] outline-none border-input",
        "has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-ring/50 has-[input:focus-visible]:ring-[3px]",
        "has-[input[aria-invalid='true']]:ring-destructive/20 dark:has-[input[aria-invalid='true']]:ring-destructive/40 has-[input[aria-invalid='true']]:border-destructive",
        "dark:bg-input/30",
        wrapperClassName
      )}
      onClick={(e) => {
        if (e.currentTarget) {
          const input = e.currentTarget.querySelector("input");
          input?.focus();
        }
      }}
    >
      {icon && (
        <span className="flex justify-center items-center pl-2 pr-1">
          {icon}
        </span>
      )}
      
      {prefix && (
        <P className={cn("flex items-center relative top-[0.05rem] text-muted-foreground text-xs cursor-default italic",
          !icon && "pl-3"
        )}>
          {prefix}
        </P>
      )}

      <input
        type={type}
        data-slot="input"
        className={cn(
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground ",
          "h-full w-full border-0 bg-transparent pr-3 pl-1 py-1 text-base shadow-xs outline-none",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus:outline-none focus-visible:ring-0 focus-visible:border-transparent",
          className
        )}
        {...props}
      />
    </div>
  );
}

export { Input, PrefixInput };

