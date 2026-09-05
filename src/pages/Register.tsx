import { useState } from 'react';
import { NavigateFn } from '../data/mock';
import { PawIcon } from '../components/Navbar';

export default function Register({ navigate }: { navigate: NavigateFn }) {
  const [form, setForm] = useState({ name: '', surname: '', email: '', phone: '', password: '', confirm: '', terms: false });
  const set = (k: keyof typeof form, v: string | boolean) => setForm({ ...form, [k]: v });

  return (
    <div className="bg-cream min-h-full flex items-center justify-center p-6 sm:p-10 py-12">
      <div className="w-full max-w-md">
        <button onClick={() => navigate('home')} className="flex items-center gap-2.5 text-terra mb-8">
          <PawIcon size={22} />
          <span className="font-display font-semibold text-lg text-dark">Patitas <span className="text-terra">Tucumán</span></span>
        </button>

        <h1 className="font-display text-3xl font-semibold text-dark mb-2">Crear cuenta</h1>
        <p className="text-warm-mid mb-8">Unite a la comunidad que cuida a los animales de Tucumán.</p>

        <div className="bg-white rounded-2xl p-7 border border-border shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-dark mb-1.5 block">Nombre</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ana" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
            </div>
            <div>
              <label className="text-sm font-medium text-dark mb-1.5 block">Apellido</label>
              <input value={form.surname} onChange={(e) => set('surname', e.target.value)} placeholder="González" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-dark mb-1.5 block">Email</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="tu@email.com" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-dark mb-1.5 block">Teléfono</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="0381 000-0000" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-dark mb-1.5 block">Contraseña</label>
            <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Mínimo 8 caracteres" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
          </div>
          <div>
            <label className="text-sm font-medium text-dark mb-1.5 block">Confirmar contraseña</label>
            <input type="password" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="Repetí tu contraseña" className="w-full px-3.5 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:border-terra transition-colors" />
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.terms as boolean}
              onChange={(e) => set('terms', e.target.checked)}
              className="mt-0.5 rounded border-border accent-terra"
            />
            <span className="text-sm text-warm-mid">
              Acepto los{' '}
              <button className="text-terra hover:underline font-medium">términos y condiciones</button>
              {' '}y la{' '}
              <button className="text-terra hover:underline font-medium">política de privacidad</button>
            </span>
          </label>
        </div>

        <div className="mt-5">
          <button
            onClick={() => navigate('login')}
            disabled={!form.terms}
            className="w-full py-3.5 bg-terra text-white font-semibold rounded-xl hover:bg-terra-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Crear cuenta
          </button>
          <p className="text-center text-sm text-warm-mid mt-5">
            ¿Ya tenés cuenta?{' '}
            <button onClick={() => navigate('login')} className="text-terra font-semibold hover:underline">
              Ingresar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
