import { cn } from "@/lib/utils"

export function Alert({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-card text-card-foreground border",
    destructive: "border-destructive/50 text-destructive bg-destructive/10",
  }
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn("relative w-full rounded-lg border p-4 text-sm", variants[variant], className)}
      {...props}
    />
  )
}
export function AlertTitle({ className, children, ...props }) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props}>
      {children}
    </h5>
  )
}
export function AlertDescription({ className, ...props }) {
  return <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
}
