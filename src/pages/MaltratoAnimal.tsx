import { useState } from 'react';
import type { NavigateFn } from '../types/navigation';
import SEO from '../components/SEO';
import Footer from '../components/Footer';
import { getActiveOrganismos } from '../lib/organismos';
import { mistreatmentTypeLabel, type MistreatmentType } from '../data/mock';

const situationTypes: MistreatmentType[] = [
  'agresion_fisica',
  'abandono',
  'falta_alimento_agua',
  'atado_permanente',
  'condiciones_insalubres',
  'falta_atencion_veterinaria',
  'animal_herido',
  'explotacion',
  'posible_envenenamiento',
  'otro',
  'no_seguro',
];

const pasos = [
  {
    n: 1,
    title: 'Mantenete seguro',
    text: 'No te enfrentes al responsable ni intentes intervenir físicamente si existe riesgo.',
  },
  {
    n: 2,
    title: 'Observá la situación',
    text: 'Identificá qué está ocurriendo, dónde, qué animal está involucrado, si está herido, si hay peligro inmediato y quiénes están presentes.',
  },
  {
    n: 3,
    title: 'Registrá información',
    text: 'Si es seguro hacerlo: fotos, videos, ubicación, fecha, hora, descripción de lo ocurrido y testigos, si los hubiera. No te expongas para conseguir pruebas.',
  },
  {
    n: 4,
    title: 'Buscá ayuda oficial',
    text: 'Recurrí a los organismos y canales oficiales disponibles en Tucumán (más abajo en esta página).',
  },
];

export default function MaltratoAnimal({ navigate }: { navigate: NavigateFn }) {
  const [selectedSituation, setSelectedSituation] = useState<MistreatmentType | null>(null);
  const organismos = getActiveOrganismos();

  const goToReport = (situation?: MistreatmentType) => {
    const chosen = situation ?? selectedSituation ?? undefined;
    try {
      if (chosen) {
        sessionStorage.setItem(
          'patitas_maltrato_prefill',
          JSON.stringify({ mistreatmentType: chosen })
        );
      } else {
        sessionStorage.removeItem('patitas_maltrato_prefill');
      }
    } catch {
      // Si el navegador bloquea sessionStorage, el usuario igual puede
      // completar el formulario manualmente sin el prellenado.
    }
    navigate('create');
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="bg-cream min-h-full">
      <SEO
        title="Maltrato Animal en Tucumán | Qué hacer y dónde denunciar — Patitas Tucumán"
        description="Guía para actuar ante un caso de maltrato, abandono o negligencia animal en Tucumán: pasos a seguir, organismos oficiales y cómo reportarlo en Patitas Tucumán."
        path="/maltrato-animal"
      />

      {/* Hero */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h1 className="font-display text-4xl lg:text-5xl font-semibold text-dark mb-4">
            ¿Viste un caso de maltrato animal?
          </h1>
          <p className="text-warm-mid text-lg mb-8 max-w-2xl mx-auto">
            Te explicamos qué hacer, cómo actuar de forma segura y dónde pedir ayuda.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => goToReport()}
              className="px-7 py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
            >
              REPORTAR CASO
            </button>
            <button
              onClick={() => scrollTo('pasos-maltrato')}
              className="px-7 py-3.5 border-2 border-border text-dark font-semibold rounded-xl hover:border-terra hover:text-terra transition-colors"
            >
              ¿QUÉ HAGO AHORA?
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Emergencia */}
        <section className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-red-800 mb-2">
            ¿El animal está en peligro ahora?
          </h2>
          <p className="text-red-800/90 mb-5">
            Si existe un peligro inmediato para el animal, para vos o para otras personas, no te
            expongas ni enfrentes al responsable.
          </p>
          <a
            href="tel:911"
            className="inline-flex items-center justify-center px-7 py-3.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
          >
            LLAMAR AL 911
          </a>
          <p className="text-xs text-red-800/70 mt-3">
            El 911 corresponde al servicio de emergencias policiales. No es una línea exclusiva de
            maltrato animal.
          </p>
        </section>

        {/* Pasos */}
        <section id="pasos-maltrato">
          <h2 className="font-display text-3xl font-semibold text-dark mb-8 text-center">
            Qué hacer, paso a paso
          </h2>
          <div className="space-y-5">
            {pasos.map((s) => (
              <div key={s.n} className="flex gap-4 bg-white border border-border rounded-2xl p-5">
                <div className="w-10 h-10 shrink-0 rounded-full bg-terra text-white font-bold flex items-center justify-center">
                  {s.n}
                </div>
                <div>
                  <h3 className="font-semibold text-dark mb-1">{s.title}</h3>
                  <p className="text-sm text-warm-mid">{s.text}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-4 bg-white border-2 border-terra rounded-2xl p-5">
              <div className="w-10 h-10 shrink-0 rounded-full bg-terra text-white font-bold flex items-center justify-center">
                5
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-dark mb-1">Reportalo en Patitas Tucumán</h3>
                <p className="text-sm text-warm-mid mb-4">
                  Podés registrar la situación dentro de Patitas Tucumán para que la comunidad y
                  quienes puedan ayudar tomen conocimiento.
                </p>
                <button
                  onClick={() => goToReport()}
                  className="px-6 py-2.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                >
                  REPORTAR ESTE CASO
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tipos de situación */}
        <section>
          <h2 className="font-display text-3xl font-semibold text-dark mb-2 text-center">
            ¿Qué tipo de situación viste?
          </h2>
          <p className="text-warm-mid text-center mb-8 max-w-xl mx-auto">
            Si no sabés exactamente cómo clasificar la situación, podés reportarla igualmente y
            describir lo que observaste.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {situationTypes.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedSituation(t)}
                className={`p-4 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                  selectedSituation === t
                    ? 'border-terra bg-terra/5 text-terra'
                    : 'border-border text-dark hover:border-terra/40'
                }`}
              >
                {mistreatmentTypeLabel[t]}
              </button>
            ))}
          </div>
          {selectedSituation && (
            <div className="text-center mt-6">
              <button
                onClick={() => goToReport(selectedSituation)}
                className="px-7 py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
              >
                REPORTAR CASO
              </button>
            </div>
          )}
        </section>

        {/* Organismos oficiales */}
        <section id="organismos-oficiales">
          <h2 className="font-display text-3xl font-semibold text-dark mb-2 text-center">
            ¿Dónde pedir ayuda?
          </h2>
          <p className="text-warm-mid text-center mb-8 max-w-xl mx-auto">
            Canales oficiales en Tucumán. Patitas Tucumán no forma parte de estos organismos: solo
            te acerca la información de contacto.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {organismos.map((o) => (
              <div key={o.id} className="bg-white border border-border rounded-2xl p-5 flex flex-col">
                <h3 className="font-semibold text-dark mb-1">{o.name}</h3>
                {o.description && <p className="text-sm text-warm-mid mb-3">{o.description}</p>}
                {o.address && <p className="text-xs text-warm-mid mb-3">{o.address}</p>}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {o.phone && (
                    <a
                      href={`tel:${o.phone}`}
                      className="px-4 py-2 bg-terra text-white text-sm font-semibold rounded-lg hover:bg-terra-dark transition-colors"
                    >
                      LLAMAR · {o.phone}
                    </a>
                  )}
                  {o.email && (
                    <a
                      href={`mailto:${o.email}`}
                      className="px-4 py-2 border-2 border-terra text-terra text-sm font-semibold rounded-lg hover:bg-terra/5 transition-colors"
                    >
                      CONTACTAR
                    </a>
                  )}
                  {o.mapsUrl && (
                    <a
                      href={o.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 border-2 border-border text-dark text-sm font-semibold rounded-lg hover:border-terra hover:text-terra transition-colors"
                    >
                      VER UBICACIÓN
                    </a>
                  )}
                  {o.officialUrl && (
                    <a
                      href={o.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 border-2 border-border text-dark text-sm font-semibold rounded-lg hover:border-terra hover:text-terra transition-colors"
                    >
                      VER INFORMACIÓN OFICIAL
                    </a>
                  )}
                </div>
                {o.lastVerified && (
                  <p className="text-[11px] text-warm-mid mt-3">
                    Última verificación: {o.lastVerified}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Denuncia formal */}
        <section className="bg-white border border-border rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-dark mb-3">
            ¿Querés realizar una denuncia formal?
          </h2>
          <p className="text-warm-mid mb-5">
            Patitas Tucumán no reemplaza una denuncia policial o judicial. Si considerás que
            ocurrió un hecho que debe ser denunciado, utilizá los canales oficiales
            correspondientes.
          </p>
          <div className="bg-warm rounded-xl p-5">
            <h3 className="font-semibold text-dark mb-1">Denuncia / intervención de autoridades</h3>
            <p className="text-sm text-warm-mid mb-4">
              Podés recurrir a los organismos oficiales correspondientes según la situación y el
              lugar donde ocurrió el hecho.
            </p>
            <button
              onClick={() => scrollTo('organismos-oficiales')}
              className="px-5 py-2.5 border-2 border-terra text-terra font-semibold rounded-xl text-sm hover:bg-terra/5 transition-colors"
            >
              VER CANALES OFICIALES
            </button>
          </div>
        </section>

        {/* Seguridad */}
        <section className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-amber-900 mb-2">
            Tu seguridad es importante
          </h2>
          <p className="text-amber-900/90 text-sm">
            No confrontes a una persona que esté maltratando a un animal. No ingreses a propiedades
            privadas y no intentes rescatar al animal si eso puede ponerte en peligro. Si existe
            una emergencia, comunicá la situación a las autoridades correspondientes.
          </p>
        </section>
      </div>

      <Footer navigate={navigate} />
    </div>
  );
}