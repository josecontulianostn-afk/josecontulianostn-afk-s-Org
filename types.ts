export interface Perfume {
  id: string;
  brand: string;
  name: string;
  description: string;
  price5ml: number;
  price10ml: number;
  image: string;
  notes: string[];
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  includes: string[];
}

export enum ViewState {
  HOME = 'HOME',
  BOOKING = 'BOOKING',
  CATALOG = 'CATALOG',
  CONTACT = 'CONTACT',
  CONFIRMATION = 'CONFIRMATION'
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  isHomeService: boolean; // Domicilio
  address?: string; // Required if isHomeService is true
}