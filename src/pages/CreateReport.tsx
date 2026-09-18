import { useState, useRef, useEffect } from 'react';
import { AnimalStatus, AnimalType } from '../data/mock';
import {
  mistreatmentTypeLabel,
  urgencyLabel,
  urgencyDescription,
  type MistreatmentType,
  type UrgencyLevel,
} from '../data/mock';
import type { NavigateFn } from '../types/navigation';
import { createReport, uploadImages, getSession } from '../lib/api';
import SEO from '../components/SEO';

const steps = [
  { n: 1, label: 'Tipo de reporte' },
  { n: 2, label: 'Ubicación' },
  { n: 3, label: 'Fotos' },
  { n: 4, label: 'Descripción' },
  { n: 5, label: 'Contacto' },
];

type ReportType = 'perdido' | 'encontrado' | 'en_calle' | 'maltrato' | '';
type AnimalKind = 'perro' | 'gato' | 'otro' | '';

const reportTypes = [
  { value: 'perdido' as const, icon: '', label: 'Animal perdido', desc: 'Mi mascota se perdió y la estoy buscando' },
  { value: 'encontrado' as const, icon: '', label: 'Animal encontrado', desc: 'Encontré un animal que podría estar perdido' },
  { value: 'en_calle' as const, icon: '', label: 'En situación de calle', desc: 'Vi un animal que necesita ayuda en la calle' },
  { value: 'maltrato' as const, icon: '', label: 'Maltrato animal', desc: 'Vi un caso de maltrato, abandono o negligencia hacia un animal' },
];

const animalKinds = [
  { value: 'perro' as const, icon: '', label: 'Perro' },
  { value: 'gato' as const, icon: '', label: 'Gato' },
  { value: 'otro' as const, icon: '', label: 'Otro' },
];

export default function CreateReport({ navigate }: { navigate: NavigateFn }) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [reportType, setReportType] = useState<ReportType>('');
  const [animalKind, setAnimalKind] = useState<AnimalKind>('');
  const [animalName, setAnimalName] = useState('');
  const [date, setDate] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('');
  const [images, setImages] = useState<string[]>([]); // previews base64
  const [rawFiles, setRawFiles] = useState<File[]>([]); // archivos reales para subir
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [marks, setMarks] = useState('');
  const [notes, setNotes] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Campos específicos de "Maltrato animal"
  const [animalCount, setAnimalCount] = useState('1');
  const [mistreatmentType, setMistreatmentType] = useState<MistreatmentType | ''>('');
  const [apparentCondition, setApparentCondition] = useState('');
  const [inDangerNow, setInDangerNow] = useState(false);
  const [needsUrgentVet, setNeedsUrgentVet] = useState(false);
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel | ''>('');
  const [hasWitnesses, setHasWitnesses] = useState(false);
  const [witnessesInfo, setWitnessesInfo] = useState('');

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Si el usuario viene desde la sección "Maltrato Animal" con un tipo de
  // situación ya elegido, prellenamos el formulario una sola vez.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('patitas_maltrato_prefill');
      if (raw) {
        const data = JSON.parse(raw) as { mistreatmentType?: MistreatmentType };
        setReportType('maltrato');
        if (data.mistreatmentType) setMistreatmentType(data.mistreatmentType);
        sessionStorage.removeItem('patitas_maltrato_prefill');
      }
    } catch {
      // Si falla, el usuario simplemente completa el formulario a mano.
    }
  }, []);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no admite geolocalización.');
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocationError(
          err.code === err.PERMISSION_DENIED
            ? 'Denegaste el permiso de ubicación. Podés habilitarlo en la configuración del navegador.'
            : 'No se pudo obtener tu ubicación. Probá de nuevo.'
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 10 - images.length;
    const selected = Array.from(files).slice(0, remaining);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setRawFiles((prev) => [...prev, ...selected]);
    e.target.value = '';
  };

  const removeImage = (i: number) => {
    setImages((prev) => prev.filter((_, j) => j !== i));
    setRawFiles((prev) => prev.filter((_, j) => j !== i));
  };

  const progress = ((step - 1) / (steps.length - 1)) * 100;

  const isMaltrato = reportType === 'maltrato';

  // Todos los pasos son obligatorios: el botón "Continuar" queda
  // deshabilitado hasta que se complete cada campo requerido del paso actual.
  const canNext = () => {
    if (step === 1) {
      const base = reportType !== '' && animalKind !== '' && date !== '';
      if (isMaltrato) {
        return (
          base &&
          animalCount.trim() !== '' &&
          mistreatmentType !== '' &&
          apparentCondition.trim() !== '' &&
          urgencyLevel !== ''
        );
      }
      return base && animalName.trim() !== '';
    }
    if (step === 2) {
      // Dirección y zona son ambas obligatorias.
      return address.trim() !== '' && zone !== '';
    }
    if (step === 3) {
      return images.length > 0;
    }
    if (step === 4) {
      const baseOk = color.trim() !== '' && size !== '' && marks.trim() !== '' && notes.trim() !== '';
      if (isMaltrato && hasWitnesses) {
        return baseOk && witnessesInfo.trim() !== '';
      }
      return baseOk;
    }
    if (step === 5) {
      return contactName.trim() !== '' && phone.trim() !== '' && email.trim() !== '';
    }
    return true;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!getSession()) {
      setSubmitError('Necesitás iniciar sesión para publicar un reporte.');
      return;
    }
    if (!contactName || !phone || !email) {
      setSubmitError('Completá nombre, teléfono y email de contacto.');
      return;
    }
    setSubmitting(true);
    try {
      const uploadedUrls = rawFiles.length > 0 ? await uploadImages(rawFiles) : [];
      await createReport({
        name: animalName || 'Sin nombre',
        type: animalKind as AnimalType,
        status: reportType as AnimalStatus,
        zone: zone || address || 'Sin especificar',
        address: address || undefined,
        description: [marks, notes].filter(Boolean).join(' — ') || undefined,
        color: color || undefined,
        size: size || undefined,
        contactName,
        phone,
        email,
        mapLat: coords?.lat,
        mapLng: coords?.lng,
        images: uploadedUrls,
        animalCount: isMaltrato ? Number(animalCount) || undefined : undefined,
        mistreatmentType: isMaltrato ? (mistreatmentType || undefined) : undefined,
        apparentCondition: isMaltrato ? (apparentCondition || undefined) : undefined,
        inDangerNow: isMaltrato ? inDangerNow : undefined,
        needsUrgentVet: isMaltrato ? needsUrgentVet : undefined,
        urgencyLevel: isMaltrato ? (urgencyLevel || undefined) : undefined,
        hasWitnesses: isMaltrato ? hasWitnesses : undefined,
        witnessesInfo: isMaltrato && hasWitnesses ? witnessesInfo : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo publicar el reporte. Probá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-cream min-h-full flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-12 border border-border text-center max-w-md w-full shadow-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-display text-3xl font-semibold text-dark mb-3">¡Reporte publicado!</h2>
          <p className="text-warm-mid mb-8">Tu reporte ya está visible para la comunidad de Tucumán. Gracias por ayudar a los animales.</p>
          <div className="space-y-3">
            <button onClick={() => navigate('reports')} className="w-full py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors">
              Ver todos los reportes
            </button>
            <button onClick={() => { setSubmitted(false); setStep(1); }} className="w-full py-3 border border-border text-dark rounded-xl text-sm hover:border-terra hover:text-terra transition-colors">
              Hacer otro reporte
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-full">
      <SEO
        title="Crear reporte | Patitas Tucumán"
        description="Publicá un reporte de un animal perdido, encontrado, rescatado, en situación de calle o un caso de maltrato animal en Tucumán."
        path="/crear-reporte"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('home')} className="text-sm text-warm-mid hover:text-terra transition-colors mb-4 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Cancelar
          </button>
          <h1 className="font-display text-4xl font-semibold text-dark mb-1">Reportar un animal</h1>
          <p className="text-warm-mid">Tu reporte puede ayudar a que un animal vuelva a casa.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s) => (
              <div key={s.n} className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  s.n < step ? 'bg-terra text-white' : s.n === step ? 'bg-terra text-white' : 'bg-border text-warm-mid'
                }`}>
                  {s.n < step ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : s.n}
                </div>
              </div>
            ))}
          </div>
          <div className="h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-terra rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-warm-mid mt-2">Paso {step} de {steps.length} — {steps[step - 1].label}</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl p-7 border border-border shadow-sm">
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-6">¿Qué tipo de reporte querés realizar?</h2>
              <div className="space-y-3 mb-8">
                {reportTypes.map((rt) => (
                  <button
                    key={rt.value}
                    onClick={() => setReportType(rt.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      reportType === rt.value ? 'border-terra bg-terra/5' : 'border-border hover:border-terra/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{rt.icon}</span>
                      <div>
                        <p className="font-semibold text-dark text-sm">{rt.label}</p>
                        <p className="text-xs text-warm-mid">{rt.desc}</p>
                      </div>
                      {reportType === rt.value && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-terra flex items-center justify-center">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <h3 className="font-semibold text-dark mb-3">Especie *</h3>
              <div className="flex gap-3 mb-6">
                {animalKinds.map((k) => (
                  <button
                    key={k.value}
                    onClick={() => setAnimalKind(k.value)}
                    className={`flex-1 py-3 rounded-xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-1 ${
                      animalKind === k.value ? 'border-terra bg-terra/5 text-terra' : 'border-border text-warm-mid hover:border-terra/40'
                    }`}
                  >
                    <span className="text-2xl">{k.icon}</span>
                    {k.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">
                    Nombre {isMaltrato ? '(si lo sabés)' : '*'}
                  </label>
                  <input value={animalName} onChange={(e) => setAnimalName(e.target.value)} placeholder="Ej: Luna" className="w-full h-12 px-4 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">Fecha del avistamiento *</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-12 px-4 border border-border rounded-xl text-sm text-dark focus:outline-none focus:border-terra transition-colors box-border" />
                </div>
              </div>

              {isMaltrato && (
                <div className="space-y-4 border-t border-border pt-6 mt-4">
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Cantidad de animales *</label>
                    <input
                      type="number"
                      min={1}
                      value={animalCount}
                      onChange={(e) => setAnimalCount(e.target.value)}
                      className="w-full h-12 px-4 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Tipo de maltrato *</label>
                    <select
                      value={mistreatmentType}
                      onChange={(e) => setMistreatmentType(e.target.value as MistreatmentType | '')}
                      className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors"
                    >
                      <option value="">Seleccionar...</option>
                      {Object.entries(mistreatmentTypeLabel).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Estado aparente del animal *</label>
                    <input
                      value={apparentCondition}
                      onChange={(e) => setApparentCondition(e.target.value)}
                      placeholder="Ej: desnutrido, con heridas visibles"
                      className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 text-sm text-dark">
                      <input type="checkbox" checked={inDangerNow} onChange={(e) => setInDangerNow(e.target.checked)} />
                      ¿Está en peligro ahora?
                    </label>
                    <label className="flex items-center gap-2 text-sm text-dark">
                      <input type="checkbox" checked={needsUrgentVet} onChange={(e) => setNeedsUrgentVet(e.target.checked)} />
                      ¿Necesita atención veterinaria urgente?
                    </label>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Nivel de urgencia *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(Object.keys(urgencyLabel) as UrgencyLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setUrgencyLevel(lvl)}
                          className={`p-3 rounded-xl border-2 text-left text-xs transition-all ${
                            urgencyLevel === lvl ? 'border-terra bg-terra/5' : 'border-border hover:border-terra/40'
                          }`}
                        >
                          <p className="font-semibold text-dark text-sm">{urgencyLabel[lvl]}</p>
                          <p className="text-warm-mid">{urgencyDescription[lvl]}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-warm-mid mt-2">
                      Este nivel es solo orientativo y no constituye una clasificación legal.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-6">¿Dónde fue visto?</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">Dirección o referencia *</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Av. Aconquija 1200, esquina con San Lorenzo" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">Barrio o zona *</label>
                  <select value={zone} onChange={(e) => setZone(e.target.value)} className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors">
                    <option value="">Seleccionar zona...</option>
                    {['Centro', 'Yerba Buena', 'Las Talitas', 'Villa 9 de Julio', 'Lomas de Tafí', 'El Manantial', 'Alberdi', 'Ranchillos', 'Muñecas', 'San Cayetano'].map((z) => <option key={z}>{z}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">Ubicación en el mapa *</label>
                  <button
                    type="button"
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    className="w-full py-2.5 border-2 border-terra text-terra font-semibold rounded-xl text-sm hover:bg-terra/5 transition-colors disabled:opacity-50 mb-3 flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                    </svg>
                    {locating ? 'Buscando tu ubicación...' : 'Usar mi ubicación actual'}
                  </button>

                  {locationError && (
                    <p className="text-sm text-red-600 mb-3">{locationError}</p>
                  )}

                  {coords ? (
                    <div className="rounded-2xl overflow-hidden border border-border">
                      <iframe
                        title="Mapa de ubicación"
                        width="100%"
                        height="220"
                        style={{ border: 0 }}
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - 0.005}%2C${coords.lat - 0.005}%2C${coords.lng + 0.005}%2C${coords.lat + 0.005}&layer=mapnik&marker=${coords.lat}%2C${coords.lng}`}
                      />
                      <p className="text-xs text-warm-mid px-3 py-2 bg-warm">
                        Ubicación detectada: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                      </p>
                    </div>
                  ) : (
                    <div className="h-48 rounded-2xl border-2 border-dashed border-border flex items-center justify-center text-center p-6" style={{ background: 'linear-gradient(135deg, #EFE9DC 0%, #E4DDD1 100%)' }}>
                      <div>
                        <div className="text-3xl mb-2">📍</div>
                        <p className="text-sm font-medium text-dark mb-1">Sin ubicación seleccionada</p>
                        <p className="text-xs text-warm-mid">Tocá "Usar mi ubicación actual" para marcarla en el mapa</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-6">Subí fotos del animal *</h2>
              <p className="text-warm-mid text-sm mb-6">
                {isMaltrato
                  ? 'Las fotos y videos ayudan a documentar la situación. Subí al menos una foto para continuar, pero no te expongas para conseguirla.'
                  : 'Las fotos ayudan mucho a que la comunidad pueda identificar al animal. Subí al menos una foto para continuar.'}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                className="hidden"
              />

              <div className="grid grid-cols-3 gap-3 mb-4">
                {images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-warm relative group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-dark/70 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >✕</button>
                  </div>
                ))}
                {images.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-terra hover:bg-terra/5 transition-colors text-warm-mid hover:text-terra"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="text-xs font-medium">Agregar foto</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-warm-mid">Formatos: JPG, PNG. Máximo 10 fotos. Podés tomar una foto nueva o elegir desde tu galería o archivos.</p>
              {images.length === 0 && (
                <p className="text-xs text-red-600 mt-2">Subí al menos una foto para continuar.</p>
              )}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-6">Describí al animal</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Color *</label>
                    <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Ej: Dorado, marrón y blanco" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Tamaño *</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors">
                      <option value="">Seleccionar...</option>
                      <option>Pequeño (menos de 10 kg)</option>
                      <option>Mediano (10-25 kg)</option>
                      <option>Grande (más de 25 kg)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">Señas particulares *</label>
                  <input
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    placeholder="Ej: Collar azul, mancha en el ojo, cojea de la pata derecha"
                    className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">Información adicional *</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contá todo lo que sepas sobre el animal, cómo estaba cuando lo viste, si se acercaba a personas, etc."
                    rows={4}
                    className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors resize-none"
                  />
                </div>

                {isMaltrato && (
                  <div className="border-t border-border pt-4 space-y-3">
                    <label className="flex items-center gap-2 text-sm text-dark">
                      <input type="checkbox" checked={hasWitnesses} onChange={(e) => setHasWitnesses(e.target.checked)} />
                      ¿Hay testigos?
                    </label>
                    {hasWitnesses && (
                      <div>
                        <label className="text-sm font-medium text-dark mb-1.5 block">Información de testigos *</label>
                        <input
                          value={witnessesInfo}
                          onChange={(e) => setWitnessesInfo(e.target.value)}
                          placeholder="Nombre, contacto o descripción de los testigos"
                          className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5 */}
          {step === 5 && (
            <div>
              <h2 className="font-display text-2xl font-semibold text-dark mb-6">Tu información de contacto</h2>

              {isMaltrato && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 text-sm rounded-xl p-4 mb-5">
                  Importante: no te pongas en peligro para obtener fotografías, videos o información.
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Nombre *</label>
                    <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Tu nombre" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-dark mb-1.5 block">Teléfono *</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0381 000-0000" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-dark mb-1.5 block">Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
                </div>
                <div className="bg-warm rounded-xl p-4 text-sm text-warm-mid">
                  Tu información de contacto solo será visible para personas registradas que quieran ayudarte.
                </div>
              </div>
            </div>
          )}

          {submitError && (
            <div className="mt-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
              {submitError}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              disabled={submitting}
              className="px-6 py-3 border-2 border-border rounded-xl font-semibold text-dark hover:border-terra hover:text-terra transition-colors disabled:opacity-40"
            >
              Anterior
            </button>
          )}
          <button
            onClick={() => (step < 5 ? setStep(step + 1) : handleSubmit())}
            disabled={!canNext() || submitting}
            className="flex-1 py-3 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? 'Publicando...' : step === 5 ? 'Publicar reporte' : 'Continuar'}
          </button>
        </div>
      </div>
    </div>
  );
}