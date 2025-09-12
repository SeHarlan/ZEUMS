import * as React from "react"
import { cn } from "@/utils/ui-utils"
import { Label } from "@/components/ui/label"
import { P } from "../typography/Typography"

interface StatelessFormItemProps extends React.ComponentProps<"div"> {
  children: React.ReactNode
  label: string
  description?: string
  errorMessage?: string | null
}

function StatelessFormItem({ 
  className, 
  children, 
  label,
  description,
  errorMessage,
  ...props 
}: StatelessFormItemProps) {
  return (
    <div
      className={cn("grid gap-2", className)}
      {...props}
    >
      <Label
        className={cn(!!errorMessage && "text-destructive")}
      >
        {label}
      </Label>
      {children}
      {description && (
        <P
          className="text-muted-foreground text-sm"
        >
          {description}
        </P>
      )}
      {errorMessage && (
        <P
          className="text-destructive text-sm"
        >
          {errorMessage}
        </P>
      )}
    </div>
  )
}

export { StatelessFormItem }
