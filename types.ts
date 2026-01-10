export interface Perfume {
  id: string;
  brand: string;
  name: string;
  description: string;
  price5ml: number;
  price10ml: number;
  image: string;
  notes: string[];
  category: 'classic' | 'arab';
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  includes: string[];
  homeServiceOnly?: boolean;
}

export interface LoyaltyProfile {
  phone: string;
  visits: number;
  referrals: number;
  lastVisit?: string;
}

export interface Client {
  id: string;
  phone: string;
  visits: number;
  referrals: number;
  last_visit?: string;
  created_at: string;
  member_token?: string;
  tier?: 'Silver' | 'Gold' | 'Diamante';
  // Hair Loyalty
  hair_service_count?: number;
  discount_5th_visit_available?: boolean;
  free_cut_available?: boolean;
}

export interface Reward {
  id: string;
  name: string;
  cost_visits: number;
  type: string;
  allowed_perfume_segment?: 'arab' | 'classic' | null;
  description?: string;
}

export enum ViewState {
  HOME = 'HOME',
  BOOKING = 'BOOKING',
  CATALOG = 'CATALOG',
  CONTACT = 'CONTACT',
  CONFIRMATION = 'CONFIRMATION',
  LOYALTY = 'LOYALTY',
  ADMIN = 'ADMIN',
  GALLERY = 'GALLERY'
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  isHomeService: boolean; // Domicilio
  address?: string; // Required if isHomeService is true
  serviceId: string;
  serviceName: string;
  referral?: string; // Phone number or name of referrer
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}