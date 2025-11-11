import { cn } from "@/utils/ui-utils";
import { ReactNode, forwardRef } from "react";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}
interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}
interface BlockquoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
  children: ReactNode;
}

const H1 = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h1
        ref={ref}
        className={cn("font-serif scroll-m-20 text-4xl lg:text-5xl", className)}
        {...props}
      >
        {children}
      </h1>
    );
  }
);
H1.displayName = "H1";

const H2 = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn("font-serif scroll-m-20 text-3xl", className)}
        {...props}
      >
        {children}
      </h2>
    );
  }
);
H2.displayName = "H2";

const H3 = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn("font-serif scroll-m-20 text-2xl", className)}
        {...props}
      >
        {children}
      </h3>
    );
  }
);
H3.displayName = "H3";

const H4 = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <h4
        ref={ref}
        className={cn("font-serif scroll-m-20 text-xl", className)}
        {...props}
      >
        {children}
      </h4>
    );
  }
);
H4.displayName = "H4";

const P = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p ref={ref} className={cn("", className)} {...props}>
        {children}
      </p>
    );
  }
);
P.displayName = "P";

const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <blockquote 
        ref={ref}
        className={cn("mt-6 border-l-2 pl-6 italic", className)}
        {...props}
      >
        {children}
      </blockquote>
    );
  }
);
Blockquote.displayName = "Blockquote";

const InlineCode = forwardRef<HTMLElement, ParagraphProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <code
        ref={ref}
        className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)}
        {...props}
      >
        {children}
      </code>
    );
  }
);
InlineCode.displayName = "InlineCode";

export { H1, H2, H3, H4, P, Blockquote, InlineCode };
