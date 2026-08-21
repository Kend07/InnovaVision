import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === "Escape") onOpenChange?.(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        aria-label="Cerrar diálogo"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="relative z-50 max-h-[90vh] w-full max-w-lg overflow-auto">{children}</div>
    </div>
  )
}

export function DialogContent({ className, children, ...props }) {
  return (
    <div className={cn("bg-card text-card-foreground rounded-xl border p-6 shadow-lg m-4", className)} {...props}>
      {children}
    </div>
  )
}
export function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-1 mb-4", className)} {...props} />
}
export function DialogTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </h3>
  )
}
export function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}
export function DialogFooter({ className, ...props }) {
  return <div className={cn("flex justify-end gap-2 mt-6", className)} {...props} />
}
export function DialogClose({ children, onClose }) {
  return (
    <Button variant="outline" type="button" onClick={onClose}>
      {children || "Cerrar"}
    </Button>
  )
}
