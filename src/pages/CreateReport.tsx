import { useState, useRef, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';

import { AnimalStatus, AnimalType } from '../data/mock';
import {
  mistreatmentTypeLabel,
  urgencyLabel,
  urgencyDescription,
  type MistreatmentType,
  type UrgencyLevel,
} from '../data/mock';

import type { NavigateFn } from '../types/navigation';

import {
  createReport,
  uploadImages,
  getSession,
  loginWithGoogle,
  saveSession,
} from '../lib/api';

import SEO from '../components/SEO';

export default function CreateReport({
  navigate,
  onAuthModalChange,
}: {
  navigate: NavigateFn;
  onAuthModalChange?: (open: boolean) => void;
}) {
  const [authChecking, setAuthChecking] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Ancho responsive del botón de Google
  const googleBoxRef = useRef<HTMLDivElement>(null);
  const [googleWidth, setGoogleWidth] = useState(240);

  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [reportType, setReportType] = useState<
    'perdido' | 'encontrado' | 'en_calle' | 'en_adopcion' | 'maltrato'
  >('perdido');

  const [animalKind, setAnimalKind] = useState<AnimalType>('perro');
  const [animalName, setAnimalName] = useState('');
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [description, setDescription] = useState('');

  const [images, setImages] = useState<string[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<'macho' | 'hembra' | ''>('');
  const [age, setAge] = useState('');

  const [adoptionRequirements, setAdoptionRequirements] =
    useState('');
  const [adoptionContact, setAdoptionContact] = useState('');

  const [mistreatmentType, setMistreatmentType] =
    useState<MistreatmentType | ''>('');
  const [animalCount, setAnimalCount] = useState('');
  const [apparentCondition, setApparentCondition] = useState('');
  const [inDangerNow, setInDangerNow] = useState(false);
  const [needsUrgentVet, setNeedsUrgentVet] = useState(false);
  const [urgencyLevel, setUrgencyLevel] =
    useState<UrgencyLevel | ''>('');
  const [hasWitnesses, setHasWitnesses] = useState(false);
  const [witnessesInfo, setWitnessesInfo] = useState('');

  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [mapLat, setMapLat] = useState<number | undefined>();
  const [mapLng, setMapLng] = useState<number | undefined>();
  const [locationLoading, setLocationLoading] = useState(false);

  const isMaltrato = reportType === 'maltrato';
  const isAdoption = reportType === 'en_adopcion';

  /*
   * ============================================================
   * PROTECCIÓN DE ACCESO
   * ============================================================
   */

  useEffect(() => {
    const session = getSession();

    if (session) {
      setAuthChecking(false);
      setShowAuthModal(false);
      return;
    }

    sessionStorage.setItem(
      'patitas_return_after_auth',
      'create'
    );

    setShowAuthModal(true);
    setAuthChecking(false);
  }, []);

  /*
   * ============================================================
   * ANCHO RESPONSIVE DEL BOTÓN DE GOOGLE
   * ============================================================
   */

  useEffect(() => {
    const update = () => {
      const w = googleBoxRef.current?.offsetWidth ?? 240;
      setGoogleWidth(
        Math.min(400, Math.max(200, Math.floor(w)))
      );
    };

    update();
    window.addEventListener('resize', update);

    return () =>
      window.removeEventListener('resize', update);
  }, [showAuthModal, authChecking]);

  /*
   * Le avisa a App si el cartel está abierto (para mostrar
   * la página de fondo desenfocada y ocultar el botón Donar).
   */
  useEffect(() => {
    onAuthModalChange?.(showAuthModal && !getSession());

    return () => onAuthModalChange?.(false);
  }, [showAuthModal]);

  /*
   * ============================================================
   * PREFILL PARA MALTRATO ANIMAL
   * ============================================================
   */

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(
        'patitas_maltrato_prefill'
      );

      if (!raw) return;

      const data = JSON.parse(raw);

      setReportType('maltrato');

      if (data.mistreatmentType) {
        setMistreatmentType(data.mistreatmentType);
      }

      if (data.urgencyLevel) {
        setUrgencyLevel(data.urgencyLevel);
      }

      if (typeof data.inDangerNow === 'boolean') {
        setInDangerNow(data.inDangerNow);
      }

      if (typeof data.needsUrgentVet === 'boolean') {
        setNeedsUrgentVet(data.needsUrgentVet);
      }

      sessionStorage.removeItem(
        'patitas_maltrato_prefill'
      );
    } catch {
      sessionStorage.removeItem(
        'patitas_maltrato_prefill'
      );
    }
  }, []);

  /*
   * ============================================================
   * GOOGLE
   * ============================================================
   */

  const handleGoogleSuccess = async (
    credential: string | undefined
  ) => {
    if (!credential) {
      setGoogleError(
        'No se recibió el token de Google.'
      );
      return;
    }

    setGoogleLoading(true);
    setGoogleError(null);
    setSubmitError(null);

    try {
      const auth =
        await loginWithGoogle(credential);

      saveSession(auth);

      sessionStorage.removeItem(
        'patitas_return_after_auth'
      );

      setShowAuthModal(false);

      setAuthChecking(false);
    } catch (err) {
      setGoogleError(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión con Google.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  /*
   * ============================================================
   * IMÁGENES
   * ============================================================
   */

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const selected = Array.from(files).slice(
      0,
      Math.max(0, 10 - rawFiles.length)
    );

    const newRawFiles = [...rawFiles, ...selected];

    setRawFiles(newRawFiles);

    const previews = selected.map((file) =>
      URL.createObjectURL(file)
    );

    setImages((prev) =>
      [...prev, ...previews].slice(0, 10)
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) =>
      prev.filter((_, i) => i !== index)
    );

    setRawFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /*
   * ============================================================
   * UBICACIÓN
   * ============================================================
   */

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setSubmitError(
        'Tu navegador no permite obtener la ubicación.'
      );
      return;
    }

    setLocationLoading(true);
    setSubmitError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapLat(position.coords.latitude);
        setMapLng(position.coords.longitude);
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);

        setSubmitError(
          'No pudimos obtener tu ubicación. Podés continuar ingresando la dirección manualmente.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  /*
   * ============================================================
   * ENVÍO DEL REPORTE
   * ============================================================
   */

  async function handleSubmit() {
    setSubmitError(null);

    const session = getSession();

    if (!session) {
      setSubmitError(
        'Necesitás iniciar sesión para publicar un reporte.'
      );

      setShowAuthModal(true);

      sessionStorage.setItem(
        'patitas_return_after_auth',
        'create'
      );

      return;
    }

    if (!contactName.trim()) {
      setSubmitError(
        'Ingresá el nombre de contacto.'
      );
      return;
    }

    if (!phone.trim()) {
      setSubmitError(
        'Ingresá un teléfono de contacto.'
      );
      return;
    }

    if (!email.trim()) {
      setSubmitError(
        'Ingresá un email de contacto.'
      );
      return;
    }

    setSubmitting(true);

    try {
      let uploadedUrls: string[] = [];

      if (rawFiles.length > 0) {
        uploadedUrls = await uploadImages(rawFiles);
      }

      const status =
        reportType === 'perdido'
          ? 'perdido'
          : reportType === 'encontrado'
            ? 'encontrado'
            : reportType === 'en_adopcion'
              ? 'en_adopcion'
              : reportType === 'maltrato'
                ? 'maltrato'
                : 'en_calle';

      const report = await createReport({
        name: animalName.trim() || 'Sin nombre',
        type: animalKind,
        status: status as AnimalStatus,
        zone: zone.trim(),
        address: address.trim(),
        description: description.trim(),
        breed: breed.trim(),
        color: color.trim(),
        size: size.trim(),
        sex: sex || undefined,
        age: age.trim(),
        contactName: contactName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        mapLat,
        mapLng,
        images: uploadedUrls,

        ...(isMaltrato
          ? {
              animalCount: animalCount
                ? Number(animalCount)
                : undefined,

              mistreatmentType:
                mistreatmentType || undefined,

              apparentCondition:
                apparentCondition.trim() || undefined,

              inDangerNow,
              needsUrgentVet,

              urgencyLevel:
                urgencyLevel || undefined,

              hasWitnesses,

              witnessesInfo:
                witnessesInfo.trim() || undefined,
            }
          : {}),

        ...(isAdoption
          ? {
              description: [
                description.trim(),

                adoptionRequirements.trim()
                  ? `Requisitos para adopción: ${adoptionRequirements.trim()}`
                  : '',

                adoptionContact.trim()
                  ? `Información adicional: ${adoptionContact.trim()}`
                  : '',
              ]
                .filter(Boolean)
                .join('\n\n'),
            }
          : {}),
      });

      if (!report) {
        throw new Error(
          'No se pudo crear el reporte.'
        );
      }

      setSubmitted(true);

      sessionStorage.removeItem(
        'patitas_return_after_auth'
      );
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'No se pudo publicar el reporte.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  /*
   * ============================================================
   * LOADING DE AUTENTICACIÓN
   * ============================================================
   */

  if (authChecking) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <SEO
          title="Reportar animal | Patitas Tucumán"
          description="Reportá un animal en Patitas Tucumán."
          path="/crear-reporte"
          noIndex
        />

        <div className="text-center">
          <div className="w-10 h-10 border-2 border-terra border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-sm text-warm-mid">
            Verificando tu cuenta...
          </p>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * MODAL DE AUTENTICACIÓN
   * ============================================================
   */

  if (!getSession() && showAuthModal) {
    return (
      <div className="fixed inset-0 z-[60] overflow-y-auto bg-dark/30 backdrop-blur-md">
        <div className="min-h-full flex items-center justify-center p-5">
        <SEO
          title="Iniciar sesión para reportar | Patitas Tucumán"
          description="Iniciá sesión o creá una cuenta para reportar un animal."
          path="/crear-reporte"
          noIndex
        />

        <div className="relative w-full max-w-md bg-white rounded-3xl border border-border shadow-xl p-7 sm:p-8">
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(
                'patitas_return_after_auth'
              );

              navigate('home');
            }}
            className="absolute right-5 top-5 w-9 h-9 rounded-full flex items-center justify-center text-warm-mid hover:text-dark hover:bg-cream transition-colors"
            aria-label="Cerrar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18" />
              <path d="M6 6L18 18" />
            </svg>
          </button>

          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-dark mb-3">
            Para reportar un animal necesitás una cuenta
          </h1>

          <p className="text-warm-mid text-sm sm:text-base leading-relaxed mb-7">
            Crear una cuenta nos permite identificar quién
            realiza cada reporte y mantener una comunidad más
            segura y confiable.
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem(
                  'patitas_return_after_auth',
                  'create'
                );

                navigate('login');
              }}
              className="w-full py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
            >
              Ya tengo una cuenta
            </button>

            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem(
                  'patitas_return_after_auth',
                  'create'
                );

                navigate('register');
              }}
              className="w-full py-3.5 border border-border text-dark font-semibold rounded-xl hover:bg-cream transition-colors"
            >
              Registrarme
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />

            <span className="text-xs text-warm-mid">
              o continuar con
            </span>

            <div className="flex-1 h-px bg-border" />
          </div>

          <div
            ref={googleBoxRef}
            className="w-full flex justify-center overflow-hidden"
          >
            <GoogleLogin
              onSuccess={(credentialResponse) =>
                handleGoogleSuccess(
                  credentialResponse.credential
                )
              }
              onError={() =>
                setGoogleError(
                  'No se pudo iniciar sesión con Google.'
                )
              }
              theme="outline"
              size="large"
              shape="pill"
              text="continue_with"
              width={String(googleWidth)}
            />
          </div>

          {googleLoading && (
            <p className="text-center text-xs text-warm-mid mt-3">
              Ingresando con Google...
            </p>
          )}

          {googleError && (
            <div className="mt-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-600 text-center">
                {googleError}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(
                'patitas_return_after_auth'
              );

              navigate('home');
            }}
            className="w-full mt-5 py-2.5 text-sm text-warm-mid hover:text-terra transition-colors"
          >
            Volver al inicio
          </button>
        </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * REPORTE PUBLICADO
   * ============================================================
   */

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <SEO
          title="Reporte publicado | Patitas Tucumán"
          description="Tu reporte fue publicado correctamente."
          path="/crear-reporte"
          noIndex
        />

        <div className="w-full max-w-md bg-white rounded-3xl border border-border shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>

          <h1 className="font-display text-2xl font-semibold text-dark mb-3">
            Reporte publicado
          </h1>

          <p className="text-warm-mid text-sm leading-relaxed">
            Gracias por ayudar a los animales de Tucumán.
            Tu reporte ya forma parte de Patitas Tucumán.
          </p>

          <div className="mt-7 space-y-3">
            <button
              type="button"
              onClick={() => navigate('reports')}
              className="w-full py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
            >
              Ver reportes
            </button>

            <button
              type="button"
              onClick={() => navigate('home')}
              className="w-full py-3 text-sm text-warm-mid hover:text-terra transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * FORMULARIO
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-cream">
      <SEO
        title="Reportar animal | Patitas Tucumán"
        description="Reportá un animal perdido, encontrado, en situación de calle, en adopción o un caso de maltrato en Tucumán."
        path="/crear-reporte"
        noIndex
      />

      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 pt-8 pb-4">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="text-sm text-warm-mid hover:text-terra transition-colors mb-5"
        >
          ← Volver
        </button>

        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-dark">
          Reportar animal
        </h1>

        <p className="text-warm-mid mt-2">
          Completá la información para ayudar a encontrar,
          proteger o darle una oportunidad a un animal.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 pb-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                item <= step
                  ? 'bg-terra'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-3xl border border-border shadow-sm p-5 sm:p-8">
          {submitError && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">
                {submitError}
              </p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-2">
                ¿Qué querés reportar?
              </h2>

              <p className="text-sm text-warm-mid mb-6">
                Seleccioná el tipo de situación.
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  {
                    value: 'perdido',
                    label: 'Animal perdido',
                  },
                  {
                    value: 'encontrado',
                    label: 'Animal encontrado',
                  },
                  {
                    value: 'en_calle',
                    label: 'Animal en la calle',
                  },
                  {
                    value: 'en_adopcion',
                    label: 'Animal en adopción',
                  },
                  {
                    value: 'maltrato',
                    label: 'Maltrato animal',
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setReportType(
                        item.value as typeof reportType
                      )
                    }
                    className={`text-left p-4 rounded-2xl border transition-colors ${
                      reportType === item.value
                        ? 'border-terra bg-terra/5'
                        : 'border-border hover:border-terra/40'
                    }`}
                  >
                    <span className="font-semibold text-dark">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-8">
                <label className="text-sm font-medium text-dark mb-2 block">
                  Tipo de animal
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: 'perro',
                      label: 'Perro',
                    },
                    {
                      value: 'gato',
                      label: 'Gato',
                    },
                  ].map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setAnimalKind(
                          item.value as AnimalType
                        )
                      }
                      className={`p-3 rounded-xl border font-medium transition-colors ${
                        animalKind === item.value
                          ? 'border-terra bg-terra/5 text-terra'
                          : 'border-border text-dark hover:border-terra/40'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-2">
                {isAdoption
                  ? '¿En qué zona se encuentra?'
                  : '¿Dónde fue visto?'}
              </h2>

              <p className="text-sm text-warm-mid mb-6">
                {isAdoption
                  ? 'Solo necesitamos una zona general. No publicaremos una dirección exacta ni la ubicación del animal en el mapa.'
                  : 'Indicá dónde fue visto el animal para ayudar a la comunidad a encontrarlo.'}
              </p>

              <div className="space-y-4">
                {!isAdoption && (
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">
                      Dirección o referencia *
                    </label>

                    <input
                      value={address}
                      onChange={(e) =>
                        setAddress(e.target.value)
                      }
                      placeholder="Ej: Av. Aconquija 1200, esquina con San Lorenzo"
                      className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors"
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    {isAdoption
                      ? 'Zona donde se encuentra *'
                      : 'Barrio o zona *'}
                  </label>

                  <select
                    value={zone}
                    onChange={(e) =>
                      setZone(e.target.value)
                    }
                    className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors"
                  >
                    <option value="">
                      Seleccionar zona...
                    </option>

                    {[
                      'Centro',
                      'Yerba Buena',
                      'Las Talitas',
                      'Villa 9 de Julio',
                      'Lomas de Tafí',
                      'El Manantial',
                      'Alberdi',
                      'Ranchillos',
                      'Muñecas',
                      'San Cayetano',
                    ].map((z) => (
                      <option
                        key={z}
                        value={z}
                      >
                        {z}
                      </option>
                    ))}
                  </select>

                  {isAdoption && (
                    <p className="text-xs text-warm-mid mt-2">
                      Esta zona se mostrará en la publicación
                      para que las personas sepan aproximadamente
                      dónde se encuentra el animal.
                    </p>
                  )}
                </div>

                {!isAdoption && (
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">
                      Ubicación en el mapa *
                    </label>

                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={locationLoading}
                      className="w-full py-2.5 border-2 border-terra text-terra font-semibold rounded-xl text-sm hover:bg-terra/5 transition-colors disabled:opacity-50 mb-3 flex items-center justify-center gap-2"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                        />

                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                      </svg>

                      {locationLoading
                        ? 'Buscando tu ubicación...'
                        : 'Usar mi ubicación actual'}
                    </button>

                    {mapLat !== undefined &&
                      mapLng !== undefined ? (
                      <div className="rounded-2xl overflow-hidden border border-border">
                        <iframe
                          title="Mapa de ubicación"
                          width="100%"
                          height="220"
                          style={{
                            border: 0,
                          }}
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                            mapLng - 0.005
                          }%2C${
                            mapLat - 0.005
                          }%2C${
                            mapLng + 0.005
                          }%2C${
                            mapLat + 0.005
                          }&layer=mapnik&marker=${
                            mapLat
                          }%2C${mapLng}`}
                        />

                        <p className="text-xs text-warm-mid px-3 py-2 bg-warm">
                          Ubicación detectada:{' '}
                          {mapLat.toFixed(5)},{' '}
                          {mapLng.toFixed(5)}
                        </p>
                      </div>
                    ) : (
                      <div
                        className="h-48 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-center p-6"
                        style={{
                          background:
                            'linear-gradient(135deg, #EFE9DC 0%, #E4DDD1 100%)',
                        }}
                      >
                        <div>
                          <div className="text-3xl mb-2">
                            📍
                          </div>

                          <p className="text-sm font-medium text-dark mb-1">
                            Sin ubicación seleccionada
                          </p>

                          <p className="text-xs text-warm-mid">
                            Tocá "Usar mi ubicación actual" para
                            marcarla en el mapa
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3 text-sm text-warm-mid hover:text-dark"
                >
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-2">
                Ubicación y fecha
              </h2>

              <p className="text-sm text-warm-mid mb-6">
                Indicá dónde fue visto o encontrado.
              </p>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    Zona
                  </label>

                  <input
                    value={zone}
                    onChange={(e) =>
                      setZone(e.target.value)
                    }
                    placeholder="Ej. Yerba Buena"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-terra"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    Dirección
                  </label>

                  <input
                    value={address}
                    onChange={(e) =>
                      setAddress(e.target.value)
                    }
                    placeholder="Calle y número"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-terra"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    Fecha
                  </label>

                  <input
                    type="date"
                    value={date}
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-terra"
                  />
                </div>
              </div>

              <div className="mt-6 p-5 rounded-2xl border border-border bg-cream">
                <p className="font-semibold text-dark mb-2">
                  Ubicación actual
                </p>

                <p className="text-sm text-warm-mid mb-4">
                  Podés usar tu ubicación actual para marcar
                  el lugar del reporte.
                </p>

                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={locationLoading}
                  className="px-5 py-3 bg-white border border-border rounded-xl text-sm font-semibold text-dark hover:border-terra transition-colors disabled:opacity-50"
                >
                  {locationLoading
                    ? 'Obteniendo ubicación...'
                    : mapLat !== undefined
                      ? 'Ubicación obtenida'
                      : 'Usar mi ubicación'}
                </button>

                {mapLat !== undefined &&
                  mapLng !== undefined && (
                    <p className="text-xs text-green-600 mt-3">
                      Ubicación guardada correctamente.
                    </p>
                  )}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3 text-sm text-warm-mid hover:text-dark"
                >
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-2">
                Fotos y detalles
              </h2>

              <p className="text-sm text-warm-mid mb-6">
                Las imágenes pueden ayudar muchísimo a
                identificar al animal.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="relative aspect-square rounded-xl overflow-hidden bg-cream"
                  >
                    <img
                      src={image}
                      alt={`Foto ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(index)
                      }
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-dark/70 text-white flex items-center justify-center"
                      aria-label="Eliminar imagen"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {images.length < 10 && (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="aspect-square rounded-xl border-2 border-dashed border-border hover:border-terra transition-colors flex flex-col items-center justify-center text-warm-mid hover:text-terra"
                  >
                    <span className="text-2xl mb-1">
                      +
                    </span>

                    <span className="text-xs">
                      Agregar foto
                    </span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) =>
                  handleFiles(e.target.files)
                }
              />

              {isAdoption && (
                <div className="mt-7 space-y-5">
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">
                      Requisitos para adopción
                    </label>

                    <textarea
                      value={adoptionRequirements}
                      onChange={(e) =>
                        setAdoptionRequirements(
                          e.target.value
                        )
                      }
                      rows={4}
                      placeholder="Ej. compromiso de castración, patio seguro..."
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-terra"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">
                      Información adicional
                    </label>

                    <textarea
                      value={adoptionContact}
                      onChange={(e) =>
                        setAdoptionContact(
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder="Cualquier dato importante..."
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-terra"
                    />
                  </div>
                </div>
              )}

              {isMaltrato && (
                <div className="mt-7 space-y-5">
                  <h3 className="font-semibold text-dark">
                    Información del caso
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">
                        Cantidad de animales
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={animalCount}
                        onChange={(e) =>
                          setAnimalCount(
                            e.target.value
                          )
                        }
                        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-terra"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-dark mb-1.5 block">
                        Tipo de maltrato
                      </label>

                      <select
                        value={mistreatmentType}
                        onChange={(e) =>
                          setMistreatmentType(
                            e.target.value as
                              | MistreatmentType
                              | ''
                          )
                        }
                        className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-white focus:outline-none focus:border-terra"
                      >
                        <option value="">
                          Seleccionar
                        </option>

                        {Object.keys(
                          mistreatmentTypeLabel
                        ).map((key) => (
                          <option
                            key={key}
                            value={key}
                          >
                            {
                              mistreatmentTypeLabel[
                                key as MistreatmentType
                              ]
                            }
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">
                      Estado aparente
                    </label>

                    <textarea
                      value={apparentCondition}
                      onChange={(e) =>
                        setApparentCondition(
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-terra"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inDangerNow}
                        onChange={(e) =>
                          setInDangerNow(
                            e.target.checked
                          )
                        }
                        className="accent-terra"
                      />

                      <span className="text-sm text-dark">
                        Está en peligro ahora
                      </span>
                    </label>

                    <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needsUrgentVet}
                        onChange={(e) =>
                          setNeedsUrgentVet(
                            e.target.checked
                          )
                        }
                        className="accent-terra"
                      />

                      <span className="text-sm text-dark">
                        Necesita veterinario urgente
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">
                      Nivel de urgencia
                    </label>

                    <select
                      value={urgencyLevel}
                      onChange={(e) =>
                        setUrgencyLevel(
                          e.target.value as
                            | UrgencyLevel
                            | ''
                        )
                      }
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-white focus:outline-none focus:border-terra"
                    >
                      <option value="">
                        Seleccionar
                      </option>

                      {Object.keys(
                        urgencyLabel
                      ).map((key) => (
                        <option
                          key={key}
                          value={key}
                        >
                          {
                            urgencyLabel[
                              key as UrgencyLevel
                            ]
                          }
                        </option>
                      ))}
                    </select>

                    {urgencyLevel && (
                      <p className="text-xs text-warm-mid mt-2">
                        {
                          urgencyDescription[
                            urgencyLevel
                          ]
                        }
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWitnesses}
                      onChange={(e) =>
                        setHasWitnesses(
                          e.target.checked
                        )
                      }
                      className="accent-terra"
                    />

                    <span className="text-sm text-dark">
                      Hay testigos
                    </span>
                  </label>

                  {hasWitnesses && (
                    <textarea
                      value={witnessesInfo}
                      onChange={(e) =>
                        setWitnessesInfo(
                          e.target.value
                        )
                      }
                      rows={3}
                      placeholder="Datos o información de los testigos"
                      className="w-full px-4 py-3 border border-border rounded-xl text-sm resize-none focus:outline-none focus:border-terra"
                    />
                  )}
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-3 text-sm text-warm-mid hover:text-dark"
                >
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors"
                >
                  Continuar
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-2">
                Datos de contacto
              </h2>

              <p className="text-sm text-warm-mid mb-6">
                Estos datos permitirán que otras personas se
                comuniquen con vos por el reporte.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    Nombre
                  </label>

                  <input
                    value={contactName}
                    onChange={(e) =>
                      setContactName(
                        e.target.value
                      )
                    }
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-terra"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    Teléfono
                  </label>

                  <input
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="0381..."
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-terra"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    Email
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:border-terra"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-cream border border-border">
                <p className="text-xs text-warm-mid leading-relaxed">
                  Al publicar este reporte confirmás que la
                  información proporcionada es verdadera y que
                  los datos de contacto podrán ser utilizados
                  para comunicarse respecto del animal reportado.
                </p>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-5 py-3 text-sm text-warm-mid hover:text-dark"
                >
                  Atrás
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? 'Publicando...'
                    : 'Publicar reporte'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}