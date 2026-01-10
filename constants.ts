import { Perfume, Service, Review } from './types';

export const PHONE_NUMBER = "56984524774";
export const EMAIL_ADDRESS = "contacto@tus3b.cl";

export const SERVICES: Service[] = [
  {
    id: 'cut-1',
    name: 'Corte de Puntas / Flequillos',
    description: 'Mantenimiento esencial para eliminar horquillas y sanear el cabello.',
    price: 7000,
    durationMin: 30,
    includes: ['Corte técnico de puntas o flequillo', 'Sellado de puntas']
  },
  {
    id: 'cut-2',
    name: 'Corte Bordado',
    description: 'Elimina el frizz y puntas dañadas sin afectar el largo de tu cabello.',
    price: 10000,
    durationMin: 45,
    includes: ['Corte con máquina bordadora', 'Limpieza de puntas']
  },
  {
    id: 'wash-1',
    name: 'Lavado',
    description: 'Lavado profesional refrescante.',
    price: 5000,
    durationMin: 20,
    includes: ['Shampoo profesional', 'Acondicionador'],
    homeServiceOnly: true
  },
  {
    id: 'massage-1',
    name: 'Masaje Capilar',
    description: 'Tratamiento profundo para hidratar y revitalizar tu cabello.',
    price: 5000,
    durationMin: 30,
    includes: ['Ampolla o crema de tratamiento', 'Masaje craneal']
  },
  {
    id: 'brushing-1',
    name: 'Brushing',
    description: 'Peinado profesional para dar volumen, brillo y movimiento.',
    price: 14000,
    durationMin: 45,
    includes: ['Secado', 'Modelado con cepillo'],
  },
  {
    id: 'color-1',
    name: 'Aplicación de Tintura',
    description: 'Aplicación profesional de tu color (tintura no incluida).',
    price: 10000,
    durationMin: 60,
    includes: ['Aplicación uniforme', 'Lavado final'],
    homeServiceOnly: true
  }
];

export const HOME_SERVICE_FEE = 3000;
export const HOME_SERVICE_EXTRA_MINUTES = 30; // Extra time for travel/setup
export const COVERAGE_AREAS = ['Santiago Centro', 'Ñuñoa'];

// Data for perfumes using reliable product image CDNs (Notino/Unsplash)
export const PERFUMES: Perfume[] = [
  // --- STOCK ACTUAL ---
  {
    id: 'a1',
    brand: 'Maison Alhambra',
    name: 'Leonie EDP',
    description: 'Elegancia y sofisticación. Una fragancia que impone presencia.',
    price5ml: 4990,
    price10ml: 6990,
    margin5ml: 2183,
    margin10ml: 3376,
    image: '/images/perfumes/maison-alhambra-leonie.png', // Placeholder path
    notes: ['Floral', 'Ámbar', 'Vainilla'],
    category: 'arab',
    stock: true
  },
  {
    id: 'a2',
    brand: 'Maison Alhambra',
    name: 'Bad Femme',
    description: 'Atrevida y seductora. Ideal para la noche.',
    price5ml: 4990,
    price10ml: 6990,
    margin5ml: 2135,
    margin10ml: 3281,
    image: '/images/perfumes/maison-alhambra-bad-femme.png', // Placeholder path
    notes: ['Tuberosa', 'Jazmín', 'Cacao'],
    category: 'arab',
    stock: true
  },
  {
    id: 'a3',
    brand: 'Lattafa',
    name: 'Rave Now Women',
    description: 'Dulce, frutal y vibrante. Energía pura en una botella.',
    price5ml: 4990,
    price10ml: 7990,
    margin5ml: 2040,
    margin10ml: 4091,
    image: '/images/perfumes/lattafa-rave-now.png', // Placeholder path
    notes: ['Frutas Rojas', 'Malvavisco', 'Almizcle'],
    category: 'arab',
    stock: true
  },
  {
    id: 'a4',
    brand: 'Fragrance World',
    name: 'Valentia Rome',
    description: 'Inspirada en el lujo italiano. Floral y moderna.',
    price5ml: 5990,
    price10ml: 8990,
    margin5ml: 2898,
    margin10ml: 4806,
    image: '/images/perfumes/fw-valentia-rome.png', // Placeholder path
    notes: ['Jazmín', 'Grosella Negra', 'Vainilla Bourbon'],
    category: 'arab',
    stock: true
  },
  {
    id: 'a5',
    brand: 'Lattafa',
    name: 'Yara Tous',
    description: 'La versión tropical y solar de Yara. Mango y maracuyá.',
    price5ml: 5990,
    price10ml: 8990,
    margin5ml: 2850,
    margin10ml: 4711,
    image: '/images/perfumes/lattafa-yara-tous.png', // Placeholder path
    notes: ['Mango', 'Coco', 'Vainilla'],
    category: 'arab',
    stock: true
  },
  {
    id: 'a6',
    brand: 'Lattafa',
    name: 'Yara (Rosa) EDP',
    description: 'El viral de TikTok. Dulce, cremoso y adictivo.',
    price5ml: 5990,
    price10ml: 8990,
    margin5ml: 2803,
    margin10ml: 4616,
    image: '/images/perfumes/lattafa-yara.png',
    notes: ['Orquídea', 'Heliotropo', 'Frutas Tropicales'],
    category: 'arab',
    stock: true
  },
  {
    id: 'a7',
    brand: 'Lattafa',
    name: 'Ana Abiyedh',
    description: 'Limpio, almizclado y frutal. Un aroma que dura todo el día.',
    price5ml: 6990,
    price10ml: 9990,
    margin5ml: 3487,
    margin10ml: 4983,
    image: '/images/perfumes/lattafa-ana-abiyedh.png', // Placeholder path
    notes: ['Almizcle Blanco', 'Pera', 'Bergamota'],
    category: 'arab',
    stock: true
  }
];

export const GALLERY_IMAGES = [
  {
    id: '1',
    url: '/images/greici/greici-portrait.jpg',
    category: 'Cortes',
    description: 'Estilista Greici Nataly'
  },
  {
    id: '2',
    url: '/images/greici/greici-salon-wide.jpg',
    category: 'Color',
    description: 'Atención Personalizada'
  },
  {
    id: '3',
    url: '/images/greici/greici-back-view.jpg',
    category: 'Cortes',
    description: 'Acabados Perfectos'
  },
  {
    id: '4',
    url: '/images/greici/greici-red-shirt.jpg',
    category: 'Cortes',
    description: 'Precisión y Estilo'
  },
  {
    id: '5',
    url: '/images/greici/greici-side-work.jpg',
    category: 'Color',
    description: 'Técnica Profesional'
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Maria Paz',
    rating: 5,
    comment: 'Me encantó el servicio, muy profesionales y puntuales. El corte que me hicieron fue exactamente lo que pedía.',
    date: 'Hace 2 semanas'
  },
  {
    id: 'r2',
    name: 'Carla S.',
    rating: 5,
    comment: 'Increíble la atención a domicilio. Todo muy limpio y ordenado, y los perfumes huelen delicioso. Totalmente recomendada.',
    date: 'Hace 1 mes'
  },
  {
    id: 'r3',
    name: 'Valentina R.',
    rating: 5,
    comment: 'Compré el Lattafa Yara y es exquisito, llegó super rápido. Además aproveché de hacerme un masaje capilar y quedé como nueva.',
    date: 'Hace 3 semanas'
  },
  {
    id: 'r4',
    name: 'Isidora M.',
    rating: 5,
    comment: 'Excelente experiencia con Tus3B. La calidad de los productos y la dedicación en el servicio se notan. Volveré a comprar seguro.',
    date: 'Hace 1 mes'
  },
  {
    id: 'r5',
    name: 'Fernanda L.',
    rating: 5,
    comment: 'Muy buena disposición y asesoría para elegir mi perfume. Los precios son muy convenientes para la calidad que ofrecen.',
    date: 'Hace 2 semanas'
  },
  {
    id: 'r6',
    name: 'Camila J.',
    rating: 4,
    comment: 'Todo super bien, el perfume llegó en perfecto estado. Solo demoró un poquito más de lo esperado la coordinación, pero la atención un 7.',
    date: 'Hace 1 mes'
  }
];