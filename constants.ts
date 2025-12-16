import { Perfume, Service } from './types';

export const PHONE_NUMBER = "56984524774";
export const EMAIL_ADDRESS = "contacto@tus3b.cl";

export const SERVICES: Service[] = [
  {
    id: 'hair-1',
    name: 'Corte & Brushing Premium',
    description: 'Renueva tu estilo con nuestro servicio completo de corte y peinado.',
    price: 19990,
    durationMin: 60,
    includes: ['Lavado Capilar', 'Masaje Craneal Relajante', 'Corte Personalizado', 'Brushing / Styling']
  }
];

export const HOME_SERVICE_FEE = 3000;
export const HOME_SERVICE_EXTRA_MINUTES = 30; // Extra time for travel/setup
export const COVERAGE_AREAS = ['Santiago Centro', 'Ñuñoa'];

// Data for perfumes using reliable product image CDNs (Notino/Unsplash)
export const PERFUMES: Perfume[] = [
  // --- CLÁSICOS ---
  {
    id: 'p1',
    brand: 'Lancôme',
    name: 'La Vie Est Belle EDP',
    description: 'Proyectado como el líder indiscutible en valor. Destaca por su nota de "Iris Noble" y se mantiene como el pilar del lujo y la "felicidad".',
    price5ml: 9990,
    price10ml: 18990,
    image: 'https://i.notino.com/google/lancome/3605533286555_01-o.jpg',
    notes: ['Floral Gourmand', 'Iris Noble', 'Pachulí'],
    category: 'classic'
  },
  {
    id: 'p2',
    brand: 'Carolina Herrera',
    name: 'Good Girl EDP',
    description: 'Un símbolo de estatus masivo en Chile. Su aroma potente (tuberosa y café) y su icónica botella de tacón aseguran su puesto en el podio.',
    price5ml: 9990,
    price10ml: 18990,
    image: 'https://i.notino.com/google/carolina-herrera/8411061818961_01-o.jpg',
    notes: ['Ámbar Floral', 'Tuberosa', 'Café'],
    category: 'classic'
  },
  {
    id: 'p3',
    brand: 'Lancôme',
    name: 'Idôle EDP',
    description: 'Se consolida como la opción moderna y elegante, especialmente atractiva para el segmento millennial que busca notas de flores blancas y sal.',
    price5ml: 10500,
    price10ml: 19500,
    image: 'https://i.notino.com/google/lancome/3614272639638_01-o.jpg',
    notes: ['Chipre Floral', 'Flores Blancas', 'Sal'],
    category: 'classic'
  },
  {
    id: 'p4',
    brand: 'Giorgio Armani',
    name: 'Acqua Di Gioia EDP',
    description: 'Un clásico esencial para el verano chileno. Se mantiene en el top por su perfil fresco de menta y limón, ideal para el uso diario.',
    price5ml: 9500,
    price10ml: 17900,
    image: 'https://i.notino.com/google/armani/3605521172861_01-o.jpg',
    notes: ['Floral Acuática', 'Menta', 'Limón'],
    category: 'classic'
  },
  {
    id: 'p5',
    brand: 'Yves Saint Laurent',
    name: 'Black Opium EDP',
    description: 'Sigue firme en las listas de popularidad para 2025-26, siendo la opción preferida para la vida nocturna y fiestas por su intensidad.',
    price5ml: 10990,
    price10ml: 19990,
    image: 'https://i.notino.com/google/yves-saint-laurent/3365440787971_01-o.jpg',
    notes: ['Oriental Vainilla', 'Café', 'Vainilla'],
    category: 'classic'
  },
  {
    id: 'p6',
    brand: 'Dolce & Gabbana',
    name: 'Light Blue EDT',
    description: 'A pesar de las nuevas propuestas, este clásico mantiene su popularidad gracias a su reconocimiento global y frescura, ideal para primavera-verano.',
    price5ml: 8990,
    price10ml: 16990,
    image: 'https://i.notino.com/google/dolce-gabbana/3423473020263_01-o.jpg',
    notes: ['Floral Frutal', 'Manzana', 'Cedro'],
    category: 'classic'
  },

  // --- ÁRABES ---
  {
    id: 'a1',
    brand: 'Lattafa',
    name: 'Yara EDP',
    description: 'Es el fenómeno viral del momento en Chile. Destaca por su aroma dulce y cremoso (a menudo comparado con batido de fresa) y lidera las ventas online.',
    price5ml: 5990,
    price10ml: 10990,
    image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?auto=format&fit=crop&q=80&w=600', // Pink vibe
    notes: ['Orquídea', 'Heliotropo', 'Frutas Tropicales'],
    category: 'arab'
  },
  {
    id: 'a2',
    brand: 'Armaf',
    name: 'Club de Nuit Intense Woman',
    description: 'Un superventas constante en tiendas especializadas chilenas. Es muy buscado por su perfil olfativo oscuro y elegante, similar a Coco Noir de Chanel.',
    price5ml: 6500,
    price10ml: 11990,
    image: 'https://images.unsplash.com/photo-1585250462215-d9c9b506e76d?auto=format&fit=crop&q=80&w=600', // Dark vibe
    notes: ['Rosa', 'Azafrán', 'Pachulí'],
    category: 'arab'
  },
  {
    id: 'a3',
    brand: 'Lattafa',
    name: 'Eclaire EDP',
    description: 'Una tendencia creciente en 2025-26 dentro de la categoría gourmand (aromas comestibles).',
    price5ml: 6990,
    price10ml: 12500,
    image: 'https://images.unsplash.com/photo-1594035910387-fea4779426e9?auto=format&fit=crop&q=80&w=600', // Golden vibe
    notes: ['Caramelo', 'Leche', 'Miel'],
    category: 'arab'
  },
  {
    id: 'a4',
    brand: 'Armaf',
    name: 'Club de Nuit Imperiale',
    description: 'Gana popularidad por su similitud con Delina Exclusif. Es una opción floral frutal muy potente y femenina disponible en el retail local.',
    price5ml: 7500,
    price10ml: 13500,
    image: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&q=80&w=600', // White/Floral vibe
    notes: ['Lichi', 'Bergamota', 'Rosa Turca'],
    category: 'arab'
  },
  {
    id: 'a5',
    brand: 'Armaf',
    name: 'Club de Nuit Untold',
    description: 'Aunque es unisex, tiene una venta masiva en el público femenino por ser la alternativa directa al lujoso Baccarat Rouge 540.',
    price5ml: 7500,
    price10ml: 13500,
    image: 'https://images.unsplash.com/photo-1616091093461-9c1ad298e25c?auto=format&fit=crop&q=80&w=600', // Red/Amber vibe
    notes: ['Azafrán', 'Jazmín', 'Ámbar Gris'],
    category: 'arab'
  },
  {
    id: 'a6',
    brand: 'Lattafa',
    name: 'Khamrah',
    description: 'Un éxito rotundo en ventas globales y locales. Es una fragancia unisex que muchas mujeres chilenas adoptan en invierno por su calidez especiada y dulce.',
    price5ml: 7990,
    price10ml: 14500,
    image: 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?auto=format&fit=crop&q=80&w=600', // Whiskey/Warm vibe
    notes: ['Dátiles', 'Canela', 'Vainilla'],
    category: 'arab'
  }
];