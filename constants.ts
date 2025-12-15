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

// Data for perfumes using reliable product image CDNs (Notino/E-commerce style)
export const PERFUMES: Perfume[] = [
  {
    id: 'p1',
    brand: 'Lancôme',
    name: 'La Vie Est Belle',
    description: 'Destaca por la nobleza del Iris pallida, la profundidad del Pachulí y un adictivo acorde de vainilla. Aroma femenino más votado en 2025.',
    price5ml: 9800,
    price10ml: 17500,
    image: 'https://i.notino.com/google/lancome/3605533286555_01-o.jpg',
    notes: ['Iris', 'Pachulí', 'Vainilla']
  },
  {
    id: 'p2',
    brand: 'Carolina Herrera',
    name: 'Good Girl',
    description: 'Mezcla notas de café con lirio y vainilla de fondo, creando un aroma dulce y envolvente. Un clásico moderno y sexy.',
    price5ml: 8990,
    price10ml: 15990,
    image: 'https://i.notino.com/google/carolina-herrera/8411061818961_01-o.jpg',
    notes: ['Café', 'Lirio', 'Vainilla']
  },
  {
    id: 'p3',
    brand: 'Chanel',
    name: 'Chanel No. 5',
    description: 'Considerado un clásico, está compuesto por ingredientes cítricos como el limón y dulces como la miel. Elegancia atemporal.',
    price5ml: 10990,
    price10ml: 19990,
    image: 'https://i.notino.com/google/chanel/cha5no13_aedp10_03__2.jpg', // Placeholder valid-looking url or generic
    notes: ['Limón', 'Miel', 'Cítricos']
  },
  {
    id: 'p4',
    brand: 'Chanel',
    name: 'Coco Mademoiselle',
    description: 'Es un best seller fresco y muy duradero, con notas de naranja, rosa y jazmín. Lidera los mejores perfumes de 2025.',
    price5ml: 10990,
    price10ml: 19990,
    image: 'https://i.notino.com/google/chanel/chacomm_aedp10_03__2.jpg',
    notes: ['Naranja', 'Rosa', 'Jazmín']
  },
  {
    id: 'p5',
    brand: 'Christian Dior',
    name: 'Miss Dior',
    description: 'Representa sofisticación y elegancia, con notas de lirio y vainilla que ofrecen un aroma dulce que evoca la primavera.',
    price5ml: 10500,
    price10ml: 18900,
    image: 'https://i.notino.com/google/dior/3348901362832_01-o.jpg',
    notes: ['Lirio', 'Vainilla', 'Dulce']
  },
  {
    id: 'p6',
    brand: 'Yves Saint Laurent',
    name: 'Black Opium',
    description: 'Perfume ideal para las noches, con notas de salida de pimienta rosa, pera y flor de azahar, y corazón de café.',
    price5ml: 9990,
    price10ml: 17990,
    image: 'https://i.notino.com/google/yves-saint-laurent/3365440787971_01-o.jpg',
    notes: ['Pimienta Rosa', 'Pera', 'Café', 'Jazmín']
  },
  {
    id: 'p7',
    brand: 'Gucci',
    name: 'Bloom',
    description: 'Una fragancia que rinde tributo a la feminidad, con notas de jazmín, rosa y osmanto. Top ventas 2025.',
    price5ml: 9500,
    price10ml: 16900,
    image: 'https://i.notino.com/google/gucci/8005610481005_01-o.jpg',
    notes: ['Jazmín', 'Rosa', 'Osmanto']
  },
  {
    id: 'p8',
    brand: 'Paco Rabanne',
    name: 'Olympea Flora Intense',
    description: 'Fragancia poderosa y sensual que combina florales oscuros, frutos exóticos y vainilla intensa.',
    price5ml: 9200,
    price10ml: 16500,
    image: 'https://i.notino.com/google/paco-rabanne/3349668614487_01-o.jpg',
    notes: ['Florales Oscuros', 'Frutos Exóticos', 'Vainilla']
  },
  {
    id: 'p9',
    brand: 'Dior',
    name: 'J’adore',
    description: 'Icono de Dior, con una personalidad y estilo únicos. Ocupa el tercer lugar en los mejores perfumes de Chile.',
    price5ml: 10500,
    price10ml: 18900,
    image: 'https://i.notino.com/google/dior/3348900417636_01-o.jpg',
    notes: ['Floral', 'Frutal', 'Ylang-Ylang']
  },
  {
    id: 'p10',
    brand: 'Marc Jacobs',
    name: 'Daisy',
    description: 'Perfume con notas más suaves y seductoras, que mezcla fragancias florales y dulces para representar elegancia.',
    price5ml: 8990,
    price10ml: 15990,
    image: 'https://i.notino.com/google/marc-jacobs/3614227329587_01-o.jpg',
    notes: ['Floral', 'Dulce', 'Elegante']
  }
];