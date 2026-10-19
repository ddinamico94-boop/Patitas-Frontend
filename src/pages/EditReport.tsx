import { useEffect, useState } from "react"
import { type AnimalReport, type AnimalStatus, statusLabel } from "../data/mock"
import type { NavigateFn } from "../types/navigation"
import { getReport, updateReport } from "../lib/api"
import SEO from "../components/SEO"

const statuses: AnimalStatus[] = [
  "perdido",
  "encontrado",
  "en_calle",
  "ayudado",
  "rescatado",
  "maltrato",
  "en_adopcion",
  "adoptado",
]

export default function EditReport({
  id,
  navigate,
}: {
  id: string
  navigate: NavigateFn
}) {
  const [report, setReport] = useState<AnimalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    let active = true

    getReport(id)
      .then((data) => {
        if (active) setReport(data)
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el reporte.",
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id])

  function changeField(field: keyof AnimalReport, value: string) {
    setReport((current) => (current ? { ...current, [field]: value } : current))
    setSuccess("")
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!report) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await updateReport(report.id, {
        name: report.name.trim(),
        status: report.status,
        zone: report.zone.trim(),
        description: report.description.trim(),
        breed: report.breed.trim(),
        color: report.color.trim(),
        size: report.size.trim(),
        age: report.age ?? "",
        contactName: report.contact.trim(),
        phone: report.phone.trim(),
        email: report.email.trim(),
      })

      setSuccess("Los cambios se guardaron correctamente.")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los cambios.",
      )
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-600">Cargando reporte...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-cream px-4 py-16 text-center">
        <p className="text-red-700 mb-5">
          {error || "No se encontró el reporte."}
        </p>
        <button
          type="button"
          onClick={() => navigate("profile")}
          className="rounded-xl bg-amber-800 px-5 py-3 text-white"
        >
          Volver a mi perfil
        </button>
      </div>
    )
  }

  const inputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-800 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-100"

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700"

  return (
    <main className="min-h-screen bg-cream px-4 py-10">
      <SEO
        title="Editar reporte | Patitas Tucumán"
        description="Editá los datos y el estado de tu reporte."
        path={`/editar-reporte/${id}`}
        noIndex
      />

      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("profile")}
          className="mb-6 text-sm font-semibold text-amber-900 hover:underline"
        >
          ← Volver a mi perfil
        </button>

        <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Editar reporte
          </h1>
          <p className="mb-7 text-sm text-gray-600">
            Actualizá los datos para reflejar qué pasó con el animal.
          </p>

          {report.imageUrl && (
            <img
              src={report.imageUrl}
              alt={report.name}
              className="mb-6 h-48 w-full rounded-xl object-cover sm:h-64"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="edit-name" className={labelClass}>
                Nombre del animal
              </label>
              <input
                id="edit-name"
                className={inputClass}
                value={report.name}
                onChange={(e) => changeField("name", e.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div>
              <label htmlFor="edit-status" className={labelClass}>
                Estado del animal
              </label>
              <select
                id="edit-status"
                className={inputClass}
                value={report.status}
                onChange={(e) =>
                  setReport((current) =>
                    current
                      ? {
                          ...current,
                          status: e.target.value as AnimalStatus,
                        }
                      : current,
                  )
                }
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-gray-500">
                Por ejemplo, si encontraste al animal, seleccioná “Encontrado”.
                Si fue rescatado o adoptado, actualizá su estado para que la
                publicación refleje la situación actual.
              </p>
            </div>

            <div>
              <label htmlFor="edit-zone" className={labelClass}>
                Zona
              </label>
              <input
                id="edit-zone"
                className={inputClass}
                value={report.zone}
                onChange={(e) => changeField("zone", e.target.value)}
                required
                maxLength={150}
              />
            </div>

            <div>
              <label htmlFor="edit-description" className={labelClass}>
                Descripción
              </label>
              <textarea
                id="edit-description"
                className={inputClass}
                rows={5}
                value={report.description}
                onChange={(e) => changeField("description", e.target.value)}
                maxLength={5000}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-breed" className={labelClass}>
                  Raza
                </label>
                <input
                  id="edit-breed"
                  className={inputClass}
                  value={report.breed}
                  onChange={(e) => changeField("breed", e.target.value)}
                  maxLength={120}
                />
              </div>

              <div>
                <label htmlFor="edit-color" className={labelClass}>
                  Color
                </label>
                <input
                  id="edit-color"
                  className={inputClass}
                  value={report.color}
                  onChange={(e) => changeField("color", e.target.value)}
                  maxLength={120}
                />
              </div>

              <div>
                <label htmlFor="edit-size" className={labelClass}>
                  Tamaño
                </label>
                <input
                  id="edit-size"
                  className={inputClass}
                  value={report.size}
                  onChange={(e) => changeField("size", e.target.value)}
                  maxLength={80}
                />
              </div>

              <div>
                <label htmlFor="edit-age" className={labelClass}>
                  Edad
                </label>
                <input
                  id="edit-age"
                  className={inputClass}
                  value={report.age ?? ""}
                  onChange={(e) => changeField("age", e.target.value)}
                  maxLength={80}
                />
              </div>
            </div>

            <div>
              <label htmlFor="edit-contact" className={labelClass}>
                Nombre de contacto
              </label>
              <input
                id="edit-contact"
                className={inputClass}
                value={report.contact}
                onChange={(e) => changeField("contact", e.target.value)}
                required
                maxLength={150}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="edit-phone" className={labelClass}>
                  Teléfono
                </label>
                <input
                  id="edit-phone"
                  type="tel"
                  className={inputClass}
                  value={report.phone}
                  onChange={(e) => changeField("phone", e.target.value)}
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <label htmlFor="edit-email" className={labelClass}>
                  Email
                </label>
                <input
                  id="edit-email"
                  type="email"
                  className={inputClass}
                  value={report.email}
                  onChange={(e) => changeField("email", e.target.value)}
                  required
                  maxLength={254}
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            {success && (
              <p
                role="status"
                className="rounded-xl bg-green-50 p-3 text-sm text-green-800"
              >
                {success}
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-amber-800 px-6 py-3 font-semibold text-white transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() => navigate("detail", report.id)}
                className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Ver reporte
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
