import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function CancelDialog({ open, onOpenChange, onConfirm, cargando }) {
  const [motivo, setMotivo] = useState("")
  const [error, setError] = useState("")

  function handleConfirm() {
    const v = motivo.trim()
    if (v.length < 5) {
      setError("El motivo debe tener al menos 5 caracteres")
      return
    }
    if (v.length > 255) {
      setError("El motivo no puede superar 255 caracteres")
      return
    }
    setError("")
    onConfirm?.(v)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar cita</DialogTitle>
          <DialogDescription>Esta acción cambiará el estado a Cancelada y liberará el horario. Ingrese el motivo de cancelación.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="motivoCancelacion">Motivo de cancelación</Label>
          <textarea
            id="motivoCancelacion"
            rows={3}
            className="border-input flex min-h-20 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            placeholder="El cliente informó que no podrá asistir..."
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange?.(false)} disabled={cargando}>
            Volver
          </Button>
          <Button variant="destructive" type="button" onClick={handleConfirm} disabled={cargando}>
            {cargando ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
