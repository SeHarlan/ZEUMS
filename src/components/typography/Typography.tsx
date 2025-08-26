import { cn } from "@/utils/ui-utils";
import { FC, ReactNode } from "react";

interface Props {
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}

const H1: FC<Props> = ({ className, children, style }) => {
  return (
    <h1
      className={cn("font-serif scroll-m-20 text-4xl lg:text-5xl", className)}
      style={style}
    >
      {children}
    </h1>
  );
};

const H2: FC<Props> = ({ className, children }) => {
  return (
    <h2
      className={cn("font-serif scroll-m-20 text-3xl", className)}
    >
      {children}
    </h2>
  );
};

const H3: FC<Props> = ({ className, children }) => {
  return (
    <h3
      className={cn("font-serif scroll-m-20 text-2xl", className)}
    >
      {children}
    </h3>
  );
};

const H4: FC<Props> = ({ className, children }) => {
  return (
    <h4
      className={cn("font-serif scroll-m-20 text-xl", className)}
    >
      {children}
    </h4>
  );
};

const P: FC<Props> = ({ className, children, style }) => {
  return (
    <p className={cn("", className)} style={style}>
      {children}
    </p>
  );
};

const Blockquote: FC<Props> = ({ className, children }) => {
  return (
    <blockquote className={cn("mt-6 border-l-2 pl-6 italic", className)}>
      {children}
    </blockquote>
  );
};

const InlineCode: FC<Props> = ({ className, children }) => {
  return (
    <code
      className={cn("relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold", className)}
    >
      {children}
    </code>
  );
};

export { H1, H2, H3, H4, P, Blockquote, InlineCode };
