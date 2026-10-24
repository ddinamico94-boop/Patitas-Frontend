import { useState } from "react"
import type { NavigateFn } from "../types/navigation"
import SEO from "../components/SEO"
import Footer from "../components/Footer"
import { getActiveOrganismos } from "../lib/organismos"
import { mistreatmentTypeLabel, type MistreatmentType } from "../data/mock"

const situationTypes: MistreatmentType[] = [
  "agresion_fisica",
  "abandono",
  "falta_alimento_agua",
  "atado_permanente",
  "condiciones_insalubres",
  "falta_atencion_veterinaria",
  "animal_herido",
  "explotacion",
  "posible_envenenamiento",
  "otro",
  "no_seguro",
]

const pasos = [
  {
    numero: "01",
    titulo: "Mantené la seguridad",
    texto:
      "No confrontes al responsable ni ingreses a una propiedad privada. Si hay peligro inmediato, alejate y pedí ayuda.",
  },
  {
    numero: "02",
    titulo: "Registrá lo que observaste",
    texto:
      "Anotá la ubicación, fecha, hora y descripción de la situación. Si es seguro, conservá fotos o videos obtenidos sin exponerte.",
  },
  {
    numero: "03",
    titulo: "Reuní información útil",
    texto:
      "Si los tenés, anotá datos del posible responsable y de testigos. No arriesgues tu seguridad para conseguir pruebas.",
  },
  {
    numero: "04",
    titulo: "Contactá a las autoridades",
    texto:
      "Consultá los canales oficiales disponibles en Tucumán para saber dónde corresponde realizar la denuncia.",
  },
]

export default function MaltratoAnimal({ navigate }: { navigate: NavigateFn }) {
  const [selectedSituation, setSelectedSituation] =
    useState<MistreatmentType | null>(null)

  const organismos = getActiveOrganismos()

  const goToReport = (situation?: MistreatmentType) => {
    const chosen = situation ?? selectedSituation ?? undefined

    try {
      if (chosen) {
        sessionStorage.setItem(
          "patitas_maltrato_prefill",
          JSON.stringify({ mistreatmentType: chosen }),
        )
      } else {
        sessionStorage.removeItem("patitas_maltrato_prefill")
      }
    } catch {
      // El reporte puede completarse manualmente si sessionStorage no está disponible.
    }

    navigate("create")
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  const panelClass =
    "rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-6"

  const panelTitleClass =
    "mb-3 rounded-xl bg-terra/10 px-4 py-3 text-center text-sm font-extrabold uppercase tracking-wide text-terra-dark"

  return (
    <div className="min-h-full bg-cream font-sans text-dark">
      <SEO
        title="Protocolo de Maltrato Animal en Tucumán | Patitas Tucumán"
        description="Información para reconocer situaciones de maltrato animal, actuar con seguridad y conocer cómo reportar y dónde pedir ayuda en Tucumán."
        path="/maltrato-animal"
      />

      {/* Encabezado */}
      <header className="border-b border-border bg-warm">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-center sm:gap-6 sm:py-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-terra-dark">
              Patitas Tucumán · Guía ciudadana
            </p>

            <h1 className="mt-2 font-display font-display text-2xl font-semibold uppercase leading-tight text-dark sm:text-4xl">
              Protocolo de denuncia por maltrato animal
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm text-dark/80 sm:text-base">
              Conocé qué situaciones requieren atención, cómo actuar de forma
              segura y dónde buscar ayuda.
            </p>
          </div>
        </div>
      </header>

      {/* Acciones principales */}
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-dark">
              ¿Viste una situación de maltrato?
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-warm-mid">
              Priorizá tu seguridad y buscá orientación por los canales
              correspondientes.
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              onClick={() => goToReport()}
              className="rounded-xl bg-terra px-5 py-3 text-sm font-bold text-white transition hover:bg-terra-dark"
            >
              REPORTAR CASO
            </button>

            <button
              onClick={() => scrollTo("como-denunciar")}
              className="rounded-xl border-2 border-terra px-5 py-3 text-sm font-bold text-terra-dark transition hover:bg-warm"
            >
              CÓMO DENUNCIAR
            </button>
          </div>
        </section>
        {/* Marco legal */}
        <section className={panelClass}>
          <div className={panelTitleClass}>Marco legal</div>

          <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark">
                Protección y bienestar animal
              </h2>

              <p className="mt-3 leading-relaxed text-warm-mid">
                La Ley Nacional 14.346 contempla sanciones para actos de
                maltrato y crueldad contra los animales. Cada situación debe
                evaluarse según los hechos y las circunstancias concretas.
              </p>

              <p className="mt-3 text-sm text-warm-mid">
                Esta guía es informativa y no reemplaza el asesoramiento legal
                ni la intervención de las autoridades competentes.
              </p>
            </div>

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-warm text-5xl sm:mx-0">
              ⚖️
            </div>
          </div>
        </section>

        {/* Diferencia entre maltrato y crueldad */}
        <section className="grid gap-5 md:grid-cols-2">
          <article className={panelClass}>
            <div className={panelTitleClass}>¿Qué es el maltrato?</div>

            <p className="mb-4 text-center leading-relaxed text-warm-mid">
              Son conductas u omisiones que afectan el bienestar de un animal.
              Algunos ejemplos que pueden requerir intervención son:
            </p>

            <ul className="space-y-3">
              {[
                "No proporcionar alimento o agua suficiente.",
                "Mantener al animal en condiciones insalubres.",
                "No brindarle atención cuando está enfermo o herido.",
                "Mantenerlo atado permanentemente en condiciones perjudiciales.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed">
                  <span className="font-black text-terra">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className={panelClass}>
            <div className={panelTitleClass}>¿Qué es la crueldad?</div>

            <p className="mb-4 text-center leading-relaxed text-warm-mid">
              Comprende actos de violencia u otras conductas graves hacia los
              animales. Según el caso, pueden incluir:
            </p>

            <ul className="space-y-3">
              {[
                "Agresiones físicas intencionales.",
                "Heridas provocadas deliberadamente.",
                "Actos de tortura u otras formas de sufrimiento grave.",
                "Otras conductas que puedan encuadrarse legalmente como crueldad.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed">
                  <span className="font-black text-terra">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* Recomendaciones para actuar */}
        <section id="como-denunciar" className={panelClass}>
          <div className={panelTitleClass}>Cómo actuar ante un caso</div>

          <h2 className="mb-6 text-center font-display text-2xl font-semibold text-dark">
            Recomendaciones paso a paso
          </h2>

          <div className="space-y-4">
            {pasos.map((paso) => (
              <article
                key={paso.numero}
                className="flex gap-4 rounded-xl border border-border bg-warm p-4"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-terra text-sm font-black text-white">
                  {paso.numero}
                </div>

                <div>
                  <h3 className="font-bold text-dark">{paso.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-warm-mid">
                    {paso.texto}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
        {/* Recomendaciones y requisitos */}
        <section className="mt-10 rounded-2xl border border-border bg-warm p-6 md:p-8">
          <h2 className="font-display text-2xl font-semibold text-dark">
            Antes de realizar una denuncia
          </h2>

          <p className="mt-3 text-dark">
            Para facilitar la intervención de las autoridades, reuní toda la
            información que puedas obtener sin ponerte en riesgo.
          </p>

          <ul className="mt-5 space-y-3 text-dark">
            {[
              "Indicá la ubicación exacta donde ocurre la situación.",
              "Describí qué está sucediendo y desde cuándo.",
              "Si es posible y seguro, aportá fotografías o videos como evidencia.",
              "Informá si el animal presenta lesiones o está en peligro inmediato.",
              "No te expongas ni confrontes a la persona denunciada.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terra/10 text-sm font-bold text-terra-dark">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Selector de situación */}
        <section className="mt-10 rounded-2xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-display text-2xl font-semibold text-dark">
            ¿Qué situación querés reportar?
          </h2>

          <p className="mt-2 text-warm-mid">
            Seleccioná la opción que mejor describa lo que estás observando.
            Podrás completar los detalles en el formulario del reporte.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {situationTypes.map((situation) => (
              <button
                key={situation}
                type="button"
                onClick={() => setSelectedSituation(situation)}
                className={`rounded-xl border-2 p-4 text-left transition ${
                  selectedSituation === situation
                    ? "border-terra bg-terra/5 text-terra"
                    : "border-border text-dark hover:border-terra/40 hover:bg-cream"
                }`}
              >
                <span className="font-medium">
                  {mistreatmentTypeLabel[situation]}
                </span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToReport()}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-terra px-6 py-3.5 font-semibold text-white transition hover:bg-terra-dark sm:w-auto"
          >
            Continuar al formulario →
          </button>
        </section>

        {/* Organismos oficiales */}
        <section className="mt-10">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-dark">
              Organismos y contactos útiles
            </h2>
            <p className="mt-2 text-warm-mid">
              Consultá los canales disponibles para solicitar orientación o
              comunicar una situación de maltrato animal.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {organismos.map((organismo, index) => (
              <article
                key={organismo.name ?? index}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm"
              >
                <h3 className="font-display text-lg font-semibold text-dark">
                  {organismo.name}
                </h3>

                {organismo.description && (
                  <p className="mt-2 text-sm leading-6 text-warm-mid">
                    {organismo.description}
                  </p>
                )}

                <div className="mt-4 space-y-2 text-sm text-dark">
                  {organismo.phone && (
                    <p>
                      <span className="font-semibold">Teléfono: </span>
                      {organismo.phone}
                    </p>
                  )}

                  {organismo.email && (
                    <p className="break-words">
                      <span className="font-semibold">Correo: </span>
                      {organismo.email}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {organismo.phone && (
                    <a
                      href={`tel:${organismo.phone.replace(/[^\d+]/g, "")}`}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-dark transition hover:bg-warm"
                    >
                      Llamar
                    </a>
                  )}

                  {organismo.email && (
                    <a
                      href={`mailto:${organismo.email}`}
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-dark transition hover:bg-warm"
                    >
                      Enviar correo
                    </a>
                  )}

                  {organismo.mapsUrl && (
                    <a
                      href={organismo.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-dark transition hover:bg-warm"
                    >
                      Cómo llegar
                    </a>
                  )}

                  {organismo.officialUrl && (
                    <a
                      href={organismo.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-terra px-4 py-2 text-sm font-semibold text-white transition hover:bg-terra"
                    >
                      Sitio oficial
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <p className="mt-4 text-sm text-warm-mid">
            Verificá los horarios, los teléfonos y los canales de atención antes
            de trasladarte o enviar información. La disponibilidad puede variar.
          </p>
        </section>

        {/* Cierre y llamado a la acción */}
        <section className="mt-10 rounded-2xl bg-terra p-6 text-white md:p-8">
          <h2 className="font-display text-2xl font-semibold">
            Tu intervención puede hacer la diferencia
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-white/85">
            Si conocés una situación de maltrato animal, informar lo ocurrido
            puede ayudar a que el caso llegue a las personas u organismos
            correspondientes. Aportá información clara y priorizá siempre tu
            seguridad.
          </p>

          <button
            type="button"
            onClick={() => goToReport(selectedSituation)}
            className="mt-6 rounded-xl bg-white px-6 py-3 font-semibold text-terra-dark transition hover:bg-warm"
          >
            Crear reporte
          </button>
        </section>
      </main>

      <Footer />
    </div>
  )
}
