import { useEffect, useState, useRef } from "react"
import { Label } from "@/components/ui/label"

const FORMATOS_PERMITIDOS = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
const TAMANO_MAXIMO_MB = 2

export default function ImageUploadField({ label, previewUrlInicial, onArchivoSeleccionado, errorExterno }) {
    const [previewUrl, setPreviewUrl] = useState(previewUrlInicial || null)
    const [error, setError] = useState(null)
    const inputRef = useRef(null)
    const objectUrlRef = useRef(null)

    useEffect(() => {
        setPreviewUrl(previewUrlInicial || null)
    }, [previewUrlInicial])

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current)
            }
        }
    }, [])

    function manejarCambio(evento) {
        const archivo = evento.target.files[0]
        if (!archivo) return

        if (!FORMATOS_PERMITIDOS.includes(archivo.type)) {
            setError("Formato no permitido. Usa JPG, PNG o WEBP.")
            evento.target.value = ""
            return
        }

        const tamanoMB = archivo.size / (1024 * 1024)
        if (tamanoMB > TAMANO_MAXIMO_MB) {
            setError(`La imagen no debe superar ${TAMANO_MAXIMO_MB} MB.`)
            evento.target.value = ""
            return
        }

        setError(null)
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current)
        }
        const urlLocal = URL.createObjectURL(archivo)
        objectUrlRef.current = urlLocal
        setPreviewUrl(urlLocal)
        onArchivoSeleccionado(archivo)
    }

    const errorVisible = errorExterno || error
    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}

            {previewUrl && (
                <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="h-32 w-32 rounded-md border object-cover"
                />
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={manejarCambio}
                aria-invalid={errorVisible ? true : undefined}
                aria-describedby={errorVisible ? "imagen-error" : undefined}
                className={`block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90 ${errorVisible ? "rounded-md ring-2 ring-destructive" : ""}`}
            />

            {errorVisible && <p id="imagen-error" className="text-sm text-destructive">{errorVisible}</p>}
        </div>
    )
}