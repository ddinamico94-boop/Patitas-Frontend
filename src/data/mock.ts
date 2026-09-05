export type AnimalStatus = 'perdido' | 'encontrado' | 'en_calle' | 'ayudado' | 'rescatado';
export type AnimalType = 'perro' | 'gato' | 'otro';
export type Page = 'home' | 'reports' | 'map' | 'create' | 'detail' | 'login' | 'register' | 'profile' | 'admin';
export type NavigateFn = (page: Page, id?: string) => void;

export interface AnimalReport {
  id: string;
  name: string;
  type: AnimalType;
  status: AnimalStatus;
  zone: string;
  date: string;
  description: string;
  breed: string;
  color: string;
  size: string;
  contact: string;
  phone: string;
  email: string;
  imageUrl: string;
  images: string[];
  lat: number;
  lng: number;
}

const B = 'https://images.unsplash.com/photo-';

export const reports: AnimalReport[] = [
  {
    id: '1', name: 'Luna', type: 'perro', status: 'perdido',
    zone: 'Yerba Buena', date: '28 ago 2026',
    description: 'Perdida cerca del country en Yerba Buena. Es muy cariñosa y responde a su nombre. Tenía collar azul con chapa de identificación cuando desapareció.',
    breed: 'Golden Retriever', color: 'Dorada', size: 'Grande',
    contact: 'María González', phone: '0381 450-1234', email: 'mgonzalez@email.com',
    imageUrl: `${B}1477884213360-7e9d7dcc1e48?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1477884213360-7e9d7dcc1e48?w=900&h=600&fit=crop&auto=format`, `${B}1533738363-b7f9aef128ce?w=900&h=600&fit=crop&auto=format`],
    lat: -26.8083, lng: -65.2954,
  },
  {
    id: '2', name: 'Michi', type: 'gato', status: 'encontrado',
    zone: 'Centro', date: '1 sep 2026',
    description: 'Gato negro encontrado deambulando por el centro. Muy manso y sociable. Parece estar bien alimentado, posiblemente tiene dueño.',
    breed: 'Doméstico pelo corto', color: 'Negro', size: 'Mediano',
    contact: 'Carlos Medina', phone: '0381 422-5678', email: 'cmedina@email.com',
    imageUrl: `${B}1494256997604-768d688b7f23?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1494256997604-768d688b7f23?w=900&h=600&fit=crop&auto=format`],
    lat: -26.8241, lng: -65.2226,
  },
  {
    id: '3', name: 'Rocky', type: 'perro', status: 'en_calle',
    zone: 'Villa 9 de Julio', date: '30 ago 2026',
    description: 'Perro en situación de calle visto repetidamente en la zona. Aparentemente tiene una herida en la pata trasera derecha. Necesita atención veterinaria urgente.',
    breed: 'Labrador mestizo', color: 'Marrón', size: 'Grande',
    contact: 'Ana Suárez', phone: '0381 435-9012', email: 'asuarez@email.com',
    imageUrl: `${B}1587300003388-59208cc962cb?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1587300003388-59208cc962cb?w=900&h=600&fit=crop&auto=format`],
    lat: -26.8467, lng: -65.2274,
  },
  {
    id: '4', name: 'Nala', type: 'perro', status: 'rescatado',
    zone: 'Lomas de Tafí', date: '25 ago 2026',
    description: 'Perra rescatada gracias a la comunidad de Patitas Tucumán. Ya tiene hogar temporal con una familia de voluntarios. ¡Muchas gracias a todos!',
    breed: 'Chihuahua', color: 'Beige y blanco', size: 'Pequeño',
    contact: 'Lucía Torres', phone: '0381 461-3456', email: 'ltorres@email.com',
    imageUrl: `${B}1543466835-00a7907e9de1?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1543466835-00a7907e9de1?w=900&h=600&fit=crop&auto=format`],
    lat: -26.8600, lng: -65.2500,
  },
  {
    id: '5', name: 'Simba', type: 'gato', status: 'perdido',
    zone: 'Las Talitas', date: '2 sep 2026',
    description: 'Gato atigrado perdido cerca de la plaza de Las Talitas. Es castrado y usa collar rojo. Muy asustadizo, acercarse con paciencia y calma.',
    breed: 'Atigrado doméstico', color: 'Gris y negro', size: 'Mediano',
    contact: 'Diego Ruiz', phone: '0381 478-7890', email: 'druiz@email.com',
    imageUrl: `${B}1514888286974-6c03e2ca1dba?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1514888286974-6c03e2ca1dba?w=900&h=600&fit=crop&auto=format`],
    lat: -26.7667, lng: -65.2333,
  },
  {
    id: '6', name: 'Pelusa', type: 'perro', status: 'ayudado',
    zone: 'San Cayetano', date: '20 ago 2026',
    description: 'Perra mestiza que fue alimentada y atendida por voluntarios de la comunidad. Continúa en búsqueda activa de una familia adoptante.',
    breed: 'Mestiza', color: 'Blanco y marrón', size: 'Mediano',
    contact: 'Patricia Vega', phone: '0381 492-2345', email: 'pvega@email.com',
    imageUrl: `${B}1552053831-71594a27632d?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1552053831-71594a27632d?w=900&h=600&fit=crop&auto=format`],
    lat: -26.8700, lng: -65.1900,
  },
  {
    id: '7', name: 'Max', type: 'perro', status: 'perdido',
    zone: 'Yerba Buena Alta', date: '3 sep 2026',
    description: 'Border collie perdido en la zona alta de Yerba Buena. Tiene chip de identificación. Responde a su nombre y es muy activo.',
    breed: 'Border Collie', color: 'Negro y blanco', size: 'Mediano',
    contact: 'Roberto Campos', phone: '0381 415-6789', email: 'rcampos@email.com',
    imageUrl: `${B}1518717758536-85ae29035b6d?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1518717758536-85ae29035b6d?w=900&h=600&fit=crop&auto=format`],
    lat: -26.8000, lng: -65.3100,
  },
  {
    id: '8', name: 'Mia', type: 'gato', status: 'encontrado',
    zone: 'Alberdi', date: '4 sep 2026',
    description: 'Gata siamesa encontrada en el barrio Alberdi. Tiene vacunas al día según su apariencia. Muy dócil y cariñosa con las personas.',
    breed: 'Siamesa', color: 'Crema y marrón oscuro', size: 'Mediano',
    contact: 'Valeria Herrera', phone: '0381 428-0123', email: 'vherrera@email.com',
    imageUrl: `${B}1533738363-b7f9aef128ce?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1533738363-b7f9aef128ce?w=900&h=600&fit=crop&auto=format`],
    lat: -26.8300, lng: -65.2350,
  },
  {
    id: '9', name: 'Toby', type: 'perro', status: 'en_calle',
    zone: 'Ranchillos', date: '1 sep 2026',
    description: 'Perro salchicha visto merodeando solo cerca de la ruta. Parece desorientado y asustado. No se acerca fácilmente.',
    breed: 'Dachshund', color: 'Marrón oscuro', size: 'Pequeño',
    contact: 'Fernando López', phone: '0381 449-4567', email: 'flopez@email.com',
    imageUrl: `${B}1574158622682-e40e69881006?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1574158622682-e40e69881006?w=900&h=600&fit=crop&auto=format`],
    lat: -26.7500, lng: -65.1000,
  },
  {
    id: '10', name: 'Cleo', type: 'perro', status: 'perdido',
    zone: 'Muñecas', date: '5 sep 2026',
    description: 'Perra dálmata de 3 años que escapó del jardín durante la tormenta. Usa collar rojo. Tiene miedo a los truenos y puede estar escondida.',
    breed: 'Dálmata', color: 'Blanco con manchas negras', size: 'Grande',
    contact: 'Sabrina Morales', phone: '0381 463-8901', email: 'smorales@email.com',
    imageUrl: `${B}1518791841217-8f162f1912da?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1518791841217-8f162f1912da?w=900&h=600&fit=crop&auto=format`],
    lat: -26.8350, lng: -65.2150,
  },
  {
    id: '11', name: 'Felix', type: 'gato', status: 'encontrado',
    zone: 'Centro', date: '3 sep 2026',
    description: 'Gato persa encontrado en la plaza Independencia. Muy limpio y bien cuidado. Claramente tiene un hogar, lo esperan.',
    breed: 'Persa', color: 'Gris plateado', size: 'Mediano',
    contact: 'Agustina Ramos', phone: '0381 417-2345', email: 'aramos@email.com',
    imageUrl: `${B}1513360371489-6eed1d83b994?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1513360371489-6eed1d83b994?w=900&h=600&fit=crop&auto=format`],
    lat: -26.8220, lng: -65.2200,
  },
  {
    id: '12', name: 'Bella', type: 'perro', status: 'rescatado',
    zone: 'El Manantial', date: '18 ago 2026',
    description: 'Perra caniche rescatada y adoptada por una familia de El Manantial gracias a la comunidad de Patitas Tucumán. ¡Historia con final feliz!',
    breed: 'Caniche', color: 'Blanco', size: 'Pequeño',
    contact: 'Martina Flores', phone: '0381 482-6789', email: 'mflores@email.com',
    imageUrl: `${B}1558788353-f6de4d3a5f3e?w=600&h=400&fit=crop&auto=format`,
    images: [`${B}1558788353-f6de4d3a5f3e?w=900&h=600&fit=crop&auto=format`],
    lat: -26.9333, lng: -65.3167,
  },
];

export const statusLabel: Record<AnimalStatus, string> = {
  perdido: 'Perdido',
  encontrado: 'Encontrado',
  en_calle: 'En situación de calle',
  ayudado: 'Ayudado',
  rescatado: 'Rescatado',
};

export const statusColor: Record<AnimalStatus, string> = {
  perdido: 'bg-red-50 text-red-700 border border-red-200',
  encontrado: 'bg-blue-50 text-blue-700 border border-blue-200',
  en_calle: 'bg-amber-50 text-amber-700 border border-amber-200',
  ayudado: 'bg-green-50 text-green-700 border border-green-200',
  rescatado: 'bg-violet-50 text-violet-700 border border-violet-200',
};

export const statusDot: Record<AnimalStatus, string> = {
  perdido: '#EF4444',
  encontrado: '#3B82F6',
  en_calle: '#F59E0B',
  ayudado: '#22C55E',
  rescatado: '#8B5CF6',
};