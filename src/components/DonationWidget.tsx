import { useState } from 'react';

/*
 * Completá acá tus datos bancarios reales.
 */
const DONATION_INFO = {
  banco: 'BBVA',
  titular: 'Fabrizzio Benjamin Argañaraz',
  cbu: '0170005340000037414469',
  alias: 'PEPAQUE.SITIO.LUTERO',
};

function InfoRow({
  label,
  value,
  logo,
}: {
  label: string;
  value: string;
  logo?: string;
}) {
  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-1.5">
        <p className="text-xs text-gray-500">{label}</p>
        {logo && (
          <img src={logo} alt="" className="h-3.5 w-auto" />
        )}
      </div>
      <p className="text-sm font-medium text-dark truncate">{value}</p>
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Si el navegador bloquea el clipboard, no rompemos nada
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-dark truncate">{value}</p>
      </div>

      <button
        onClick={handleCopy}
        className="shrink-0 text-xs px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        {copied ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  );
}

export default function DonationWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 w-72 rounded-2xl bg-white shadow-xl border border-gray-100 p-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-dark">
              🐾 Ayudá a mantener el sitio
            </h3>

            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Patitas Tucumán se mantiene con donaciones. Si podés colaborar,
            estos son los datos:
          </p>

          <div>
            <InfoRow
              label="Banco"
              value={DONATION_INFO.banco}
              logo="/bbva-logo.png"
            />
            <InfoRow label="Titular" value={DONATION_INFO.titular} />
            <CopyRow label="CBU" value={DONATION_INFO.cbu} />
            <CopyRow label="Alias" value={DONATION_INFO.alias} />
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full bg-dark text-cream shadow-lg px-4 py-3 text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
      >
        {open ? 'Cerrar' : '❤️ Donar'}
      </button>
    </div>
  );
}