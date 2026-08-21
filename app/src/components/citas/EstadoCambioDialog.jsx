import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function EstadoCambioDialog({ open, onOpenChange, estados = [], estadoActualId, onConfirm, cargando }) {
  const [nuevoEstado, setNuevoEstado] = useState(String(estadoActualId || ""))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cambiar estado de la cita</DialogTitle>
          <DialogDescription>Seleccione el nuevo estado. El sistema validará las transiciones permitidas.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="estadoCitaId">Estado</Label>
          <select
            id="estadoCitaId"
            className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
          >
            <option value="">Seleccione un estado</option>
            {estados.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange?.(false)} disabled={cargando}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => onConfirm?.(Number(nuevoEstado))} disabled={cargando || !nuevoEstado || Number(nuevoEstado) === Number(estadoActualId)}>
            {cargando ? "Guardando..." : "Cambiar estado"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
