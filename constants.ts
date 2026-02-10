import { Perfume, Service, Review } from './types';

export const PHONE_NUMBER = "56984524774";
export const EMAIL_ADDRESS = "contacto@tus3b.cl";
export const INSTAGRAM_URL = "https://www.instagram.com/tus3bstyle/?igsh=MWtnc2R5MjQ0c21kOQ%3D%3D#";

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
    includes: ['Shampoo profesional', 'Acondicionador']
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
    includes: ['Aplicación uniforme', 'Lavado final']
  },
  {
    id: 'alisado-1',
    name: 'Alisado Permanente',
    description: 'Alisado profesional para un cabello liso, suave y brillante por meses.',
    price: 39990,
    durationMin: 180,
    includes: ['Evaluación del cabello', 'Alisado completo', 'Tratamiento sellador'],
    fromPrice: true
  },
  {
    id: 'mechas-1',
    name: 'Mechas',
    description: 'Iluminaciones y mechas para dar luz y dimensión a tu cabello.',
    price: 39990,
    durationMin: 150,
    includes: ['Diagnóstico capilar', 'Mechas personalizadas', 'Matizado'],
    fromPrice: true
  },
  {
    id: 'hidratacion-1',
    name: 'Hidratación',
    description: 'Tratamiento profundo para devolver la vitalidad y suavidad a tu cabello.',
    price: 14990,
    durationMin: 60,
    includes: ['Diagnóstico capilar', 'Tratamiento hidratante profundo', 'Sellado de cutículas'],
    fromPrice: true
  },
  {
    id: 'balayage-1',
    name: 'Balayage',
    description: 'Técnica de coloración para un efecto natural, degradado y luminoso.',
    price: 34990,
    durationMin: 180,
    includes: ['Diagnóstico capilar', 'Balayage personalizado', 'Matizado y sellado'],
    fromPrice: true
  }
];

export const HOME_SERVICE_FEE = 3000;
export const HOME_SERVICE_EXTRA_MINUTES = 30; // Extra time for travel/setup
export const COVERAGE_AREAS = ['Santiago Centro', 'Ñuñoa'];

// Data for perfumes using reliable product image CDNs (Notino/Unsplash)
export const PERFUMES: Perfume[] = [
  // --- CLÁSICOS DE LUJO ---
  {
    id: 'l1',
    brand: 'Lancôme',
    name: 'La Vie Est Belle EDP',
    description: 'La fragancia de la felicidad. Iris pallida, Jazmín Sambac y Azahar.',
    price5ml: 6990,
    price10ml: 12990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/la-vie-est-belle.png',
    notes: ['Iris', 'Vainilla', 'Praliné'],
    category: 'classic',
    stock: false,
    priceFullBottle: 89990
  },
  {
    id: 'l2',
    brand: 'Carolina Herrera',
    name: 'Good Girl EDP',
    description: 'Audaz y sexy, elegante y enigmática. El famoso tacón.',
    price5ml: 7990,
    price10ml: 14990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/good-girl.png',
    notes: ['Tuberosa', 'Jazmín', 'Cacao'],
    category: 'classic',
    stock: false,
    priceFullBottle: 94990
  },
  {
    id: 'l3',
    brand: 'Lancôme',
    name: 'Idôle EDP',
    description: 'Para la mujer que sueña a lo grande. Limpio y luminoso.',
    price5ml: 6990,
    price10ml: 12990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/idole.png',
    notes: ['Rosa', 'Jazmín', 'Chipre Blanco'],
    category: 'classic',
    stock: false,
    priceFullBottle: 84990
  },
  {
    id: 'l4',
    brand: 'Giorgio Armani',
    name: 'Acqua Di Gioia EDP',
    description: 'La esencia de la alegría. Fresco, acuático y cítrico.',
    price5ml: 6990,
    price10ml: 12990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/acqua-di-gioia.png',
    notes: ['Limón', 'Menta', 'Jazmín de Agua'],
    category: 'classic',
    stock: false,
    priceFullBottle: 79990
  },
  {
    id: 'l5',
    brand: 'Yves Saint Laurent',
    name: 'Black Opium EDP',
    description: 'Adrenalina y energía. Café negro y flores blancas.',
    price5ml: 7990,
    price10ml: 14990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/black-opium.png',
    notes: ['Café', 'Vainilla', 'Flores Blancas'],
    category: 'classic',
    stock: false,
    priceFullBottle: 92990
  },
  {
    id: 'l6',
    brand: 'Dolce & Gabbana',
    name: 'Light Blue EDT',
    description: 'La alegría de vivir el Mediterráneo. Fresco y frutal.',
    price5ml: 5990,
    price10ml: 9990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/light-blue.png',
    notes: ['Limón Siciliano', 'Manzana', 'Cedro'],
    category: 'classic',
    stock: false,
    priceFullBottle: 74990
  },

  // --- ÁRABES ---
  {
    id: 'a1',
    brand: 'Lattafa',
    name: 'Lattafa Yara EDP 100 ML Mujer',
    description: 'El viral de TikTok. Dulce, cremoso y adictivo.',
    price5ml: 5990,
    price10ml: 8990,
    margin5ml: 2803,
    margin10ml: 4616,
    stock: true,
    priceFullBottle: 29990,
    image: '/images/perfumes/lattafa-yara-rosa.png',
    secondaryImage: '/images/perfumes/yara-rosa-notes.jpg',
    notes: ['Orquídea', 'Heliotropo', 'Frutas Tropicales'],
    category: 'arab'
  },
  {
    id: 'a2',
    brand: 'Lattafa',
    name: 'Lattafa Yara Tous EDP 100 ML Mujer',
    description: 'La versión tropical y solar de Yara. Mango y maracuyá.',
    price5ml: 5990,
    price10ml: 8990,
    margin5ml: 2850,
    margin10ml: 4711,
    stock: true,
    priceFullBottle: 29990,
    image: '/images/perfumes/lattafa-yara-tous.png',
    secondaryImage: '/images/perfumes/yara-tous-notes.jpg',
    notes: ['Mango', 'Coco', 'Vainilla'],
    category: 'arab'
  },
  {
    id: 'a3',
    brand: 'Lattafa',
    name: 'Lattafa Rave Now Women EDP 100 ML',
    description: 'Dulce, frutal y vibrante. Energía pura en una botella.',
    price5ml: 4990,
    price10ml: 7990,
    margin5ml: 2040,
    margin10ml: 4091,
    stock: true,
    priceFullBottle: 29990,
    image: '/images/perfumes/lattafa-rave-now-women.png',
    notes: ['Frutas Rojas', 'Malvavisco', 'Almizcle'],
    category: 'arab'
  },
  {
    id: 'a4',
    brand: 'Fragrance World',
    name: 'FW Valentia Rome Intense EDP 100 ML',
    description: 'Inspirada en el lujo italiano. Floral y moderna.',
    price5ml: 5990,
    price10ml: 8990,
    margin5ml: 2898,
    margin10ml: 4806,
    stock: true,
    priceFullBottle: 29990,
    image: '/images/perfumes/fw-valentia-rome.png',
    notes: ['Jazmín', 'Grosella Negra', 'Vainilla Bourbon'],
    category: 'arab'
  },
  {
    id: 'a5',
    brand: 'Maison Alhambra',
    name: 'Maison Alhambra Leonie EDP 100 ML',
    description: 'Elegancia y sofisticación. Una fragancia que impone presencia.',
    price5ml: 4990,
    price10ml: 6990,
    margin5ml: 2183,
    margin10ml: 3376,
    stock: true,
    priceFullBottle: 27990,
    image: '/images/perfumes/maison-alhambra-leonie.png',
    notes: ['Floral', 'Ámbar', 'Vainilla'],
    category: 'arab'
  },
  {
    id: 'a6',
    brand: 'Lattafa',
    name: 'Lattafa Ana Abiyedh EDP 60 ML',
    description: 'Limpio, almizclado y frutal. Un aroma que dura todo el día.',
    price5ml: 6990,
    price10ml: 9990,
    margin5ml: 3487,
    margin10ml: 4983,
    stock: true,
    priceFullBottle: 29990,
    image: '/images/perfumes/lattafa-ana-abiyedh.png',
    notes: ['Almizcle Blanco', 'Pera', 'Bergamota'],
    category: 'arab'
  },
  {
    id: 'a7',
    brand: 'Maison Alhambra',
    name: 'Maison Alhambra Bad Femme EDP 100 ML',
    description: 'Atrevida y seductora. Ideal para la noche.',
    price5ml: 4990,
    price10ml: 6990,
    margin5ml: 2135,
    margin10ml: 3281,
    stock: true,
    priceFullBottle: 27990,
    image: '/images/perfumes/maison-alhambra-bad-femme.png',
    notes: ['Tuberosa', 'Jazmín', 'Cacao'],
    category: 'arab'
  },
  // --- DESODORANTES ---
  {
    id: 'd1',
    brand: 'Lattafa',
    name: 'Lattafa Yara Spray 200 ML',
    description: 'El complemento perfecto para tu perfume Yara.',
    price5ml: 0,
    price10ml: 0,
    margin5ml: 0,
    margin10ml: 0,
    stock: true,
    priceFullBottle: 5990,
    isSpray: true,
    image: '/images/perfumes/yara-spray.png',
    notes: ['Tropical', 'Dulce', 'Cremoso'],
    category: 'arab'
  },
  {
    id: 'd2',
    brand: 'Lattafa',
    name: 'Lattafa Qaed Al Fursan Spray 200 ML',
    description: 'Fresco, piña ahumada y maderas.',
    price5ml: 0,
    price10ml: 0,
    margin5ml: 0,
    margin10ml: 0,
    stock: true,
    priceFullBottle: 5990,
    isSpray: true,
    image: '/images/perfumes/qaed-al-fursan-spray.png',
    notes: ['Piña', 'Musgo', 'Azafrán'],
    category: 'arab'
  },
  {
    id: 'd3',
    brand: 'Lattafa',
    name: 'Lattafa Yara Tous Spray 200 ML',
    description: 'El complemento tropical para tu perfume Yara Tous.',
    price5ml: 0,
    price10ml: 0,
    margin5ml: 0,
    margin10ml: 0,
    stock: true,
    priceFullBottle: 5990,
    isSpray: true,
    image: '/images/perfumes/lattafa-yara-tous-spray.png',
    notes: ['Mango', 'Coco', 'Vainilla'],
    category: 'arab'
  },
  // --- RESTO SIN STOCK ---
  {
    id: 'a8',
    brand: 'Armaf',
    name: 'Club de Nuit Intense Woman EDP',
    description: 'Un chipre floral intenso y elegante. Misterioso.',
    price5ml: 5990,
    price10ml: 8990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/club-de-nuit-intense-woman.png',
    notes: ['Rosa', 'Azafrán', 'Geranio'],
    category: 'arab',
    stock: false
  },
  {
    id: 'a9',
    brand: 'Lattafa',
    name: 'Eclaire EDP',
    description: 'Dulce y envolvente, con notas gourmand irresistibles.',
    price5ml: 5990,
    price10ml: 8990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/lattafa-eclaire.png',
    notes: ['Caramelo', 'Leche', 'Miel'],
    category: 'arab',
    stock: false
  },
  {
    id: 'a10',
    brand: 'Armaf',
    name: 'Club de Nuit Untold EDP',
    description: 'El dupe perfecto de Baccarat Rouge 540. Lujoso y dulce.',
    price5ml: 6990,
    price10ml: 9990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/club-de-nuit-untold.png',
    notes: ['Azafrán', 'Jazmín', 'Amberwood'],
    category: 'arab',
    stock: false
  },
  {
    id: 'a11',
    brand: 'Lattafa',
    name: 'Khamrah EDP',
    description: 'Cálido y especiado. Canela, dátiles y praliné.',
    price5ml: 6990,
    price10ml: 9990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/lattafa-khamrah.png',
    notes: ['Canela', 'Dátiles', 'Praliné'],
    category: 'arab',
    stock: false
  },
  {
    id: 'a12',
    brand: 'Armaf',
    name: 'Club de Nuit Imperiale',
    description: 'Floral, fresco y frutal. Elegancia moderna.',
    price5ml: 5990,
    price10ml: 8990,
    margin5ml: 0,
    margin10ml: 0,
    image: '/images/perfumes/club-de-nuit-imperiale.png',
    notes: ['Litchi', 'Bergamota', 'Rosa Turca'],
    category: 'arab',
    stock: false
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

export const GIFTS = [
  {
    id: 'gift-red-passion',
    name: 'Red Passion',
    price: 34990,
    image: '/images/gifts/red-passion-pack.jpg',
    description: 'Hay regalos que se guardan y otros que se llevan puestos. Con el pack "Red Passion", no solo regalas la exclusividad de Lattafa y la dulzura de Ritter, sino un recordatorio constante en sus manos. Porque cada vez que tome sus llaves, sentirá el peso de un detalle hecho con el corazón.',
    includes: [
      'Perfume Ana Abiyedh 60ml',
      'Caja Roja Premium',
      '4 Chocolates Ritter',
      'Llavero Corazón'
    ],
    note: 'Consulta por otro perfume'
  },
  {
    id: 'gift-love-gold',
    name: 'Love Gold',
    price: 36990,
    image: '/images/gifts/love-gold-pack.jpg',
    description: '¿Buscas el regalo que lo diga todo por ti? Hemos reunido el aroma más deseado de Maison Alhambra con los detalles que nunca fallan. Sofisticación, flores y chocolates: la tríada perfecta para sorprender a alguien especial.',
    includes: [
      'Perfume Léonie 100ml',
      'Caja Dorada Premium',
      'Rosa Eterna',
      '4 Chocolates Ferrero'
    ],
    note: 'Consulta por otro perfume'
  },
  {
    id: 'gift-pink-sweet',
    name: 'Pink Sweet',
    price: 29990,
    image: '/images/gifts/pink-sweet-pack.jpg',
    description: 'Hay fragancias que evocan recuerdos y detalles que los mantienen vivos. Sorprende con este pack "Pink Sweet" que combina la sofisticación de Victoria\'s Secret con un detalle táctil: un llavero de corazón que será el recordatorio diario de tu amor en sus manos. Porque los mejores regalos son los que se llevan puestos y se sienten cerca.',
    includes: [
      'Body Mist Bare Vanilla Daydream 250ml',
      'Caja Rosada Premium',
      '4 Chocolates Ritter',
      'Llavero Corazón'
    ],
    note: 'Consulta por otra fragancia'
  },
  {
    id: 'gift-pink-surprise-fresh',
    name: 'Pink Surprise Box - Fresh',
    price: 21990,
    image: '/images/gifts/pink-surprise-fresh-final.jpg',
    description: 'Haz que su corazón palpite más fuerte con nuestra Pink Surprise Box. Una selección premium con la sofisticación árabe de Yara, chocolates para endulzar el día y un detalle que vivirá en sus manos: un llavero diseñado para recordarle, paso a paso, cuánto la quieres. ¡Elige la versión que más le guste y sorpréndela!',
    includes: [
      'Lattafa Yara Spray 200ml',
      'Caja Sorpresa Premium',
      '4 Chocolates',
      'Llavero de Diseño'
    ],
    note: 'Versión Spray'
  },
  {
    id: 'gift-pink-surprise-luxury',
    name: 'Pink Surprise Box - Luxury',
    price: 44990,
    image: '/images/gifts/pink-surprise-luxury-final.jpg',
    description: 'Haz que su corazón palpite más fuerte con nuestra Pink Surprise Box. Una selección premium con la sofisticación árabe de Yara, chocolates para endulzar el día y un detalle que vivirá en sus manos: un llavero diseñado para recordarle, paso a paso, cuánto la quieres. ¡Elige la versión que más le guste y sorpréndela!',
    includes: [
      'Lattafa Yara EDP 100ml',
      'Caja Sorpresa Premium',
      '4 Chocolates',
      'Llavero de Diseño'
    ],
    note: 'Versión Perfume'
  },
  {
    id: 'gift-custom',
    name: 'Arma tu regalito',
    price: 0,
    description: '¿Quieres personalizar tu regalo? Cuéntanos qué tienes en mente y te ayudamos a armarlo.',
    includes: ['Chocolates Ferrero Roche', 'Los Perfumes en Stock', 'Globo de corazón', 'Y mucho más...']
  }
];