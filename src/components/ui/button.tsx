import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils/ui-utils"
import { Loader2Icon } from "lucide-react";
import Link from "next/link";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  children,
  asChild = false,
  loading = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : "button"
  const hasPositionClass =
    className?.includes("absolute") ||
    className?.includes("fixed") ||
    className?.includes("sticky") ||
    className?.includes("static");
  
  if (loading) {
    return (
      <button
        className={cn(
          buttonVariants({ variant, size, className }),
          !hasPositionClass && "relative" //set position if it isn't so the loader can be centered
        )}
        disabled
        {...props}
      >
        {children}
        <div className="bg-inherit w-full h-full absolute inset-0 rounded-full flex items-center justify-center">
          <Loader2Icon className="size-2/3 animate-spin" />
        </div>
      </button>
    );
  }


  return (
    <Comp
      data-slot="button"
      className={cn(
        "cursor-pointer",
        buttonVariants({ variant, size, className }),
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}


function LinkButton({
  disabled,
  loading,
  href,
  target,
  rel,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
    disabled?: boolean;
    href: string;
    target?: string;
    rel?: string;
  }) {
  
  if (disabled || loading)
    return (
      <Button {...props} disabled={disabled} loading={loading} >
        {props.children}
      </Button>
    );

  return (
    <Button asChild {...props}>
      <Link
        href={href}
        target={target}
        rel={rel}
      >
        {props.children}
      </Link>
    </Button>
  );
}

export { Button, LinkButton, buttonVariants }

