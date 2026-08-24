import api from "./api"

export function subirImagen(archivo, nombreAnterior) {
    const formData = new FormData()
    formData.append("image", archivo)
    if (nombreAnterior) {
        formData.append("previousFileName", nombreAnterior)
    }
    return api.post("/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    })
}

export function urlImagen(nombreArchivo) {
    return `${api.defaults.baseURL}/images/download/${nombreArchivo}`
}
