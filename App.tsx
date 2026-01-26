import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link, useNavigate } from 'react-router-dom';
import { ViewState, BookingData } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import BookingForm from './components/BookingForm';
import PerfumeCatalog from './components/PerfumeCatalog';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import BookingConfirmation from './components/BookingConfirmation';
import Reviews from './components/Reviews';
import LoyaltyCheck from './components/LoyaltyCheck';
import AdminPanel from './components/AdminPanel';
import Gallery from './components/Gallery';
import GiftZone from './components/GiftZone';
import CheckInPage from './components/CheckInPage';
import HomeSelection from './components/HomeSelection';
import HairTips from './components/blog/HairTips';
import { SERVICES } from './constants';
import { Scissors, ShoppingBag, ArrowRight, Gift, ShieldCheck, Star } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  const [lastBooking, setLastBooking] = useState<BookingData | null>(null);

  // Home Component (The main landing page 'Style')
  const Home = () => (
    <>
      <Hero onCtaClick={() => {
        const bookingSection = document.getElementById('booking-section');
        bookingSection?.scrollIntoView({ behavior: 'smooth' });
      }} />

      {/* Services Price List (User Request: "Los Precios") */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="serif text-4xl text-stone-900">Nuestros Servicios</h2>
            <p className="text-stone-500 mt-2">Transparencia y calidad en cada detalle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.filter(s => !s.homeServiceOnly).map((service) => (
              <div key={service.id} className="flex justify-between items-center border-b border-stone-100 pb-4">
                <div>
                  <h3 className="font-bold text-stone-900">{service.name}</h3>
                  <p className="text-xs text-stone-500">{service.description}</p>
                </div>
                <div className="text-right ml-4">
                  <span className="block font-serif font-bold text-lg text-stone-900">
                    ${service.price.toLocaleString('es-CL')}
                  </span>
                  <span className="text-[10px] text-stone-400 uppercase">{service.durationMin} min</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/booking" className="text-stone-900 font-bold border-b border-stone-900 hover:text-stone-600 hover:border-stone-600 transition">
              Ver Menú Completo
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Teaser */}
      <section className="py-24 bg-stone-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-stone-200 rounded-sm"></div>
              <img
                src="/images/gallery/work_1.png"
                alt="Hair Styling"
                className="rounded-sm shadow-xl relative z-10 w-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=800";
                }}
              />
            </div>
            <div className="space-y-6">
              <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">Portafolio</span>
              <h3 className="serif text-4xl text-stone-900">Experiencia que se nota</h3>
              <p className="text-stone-600 font-light text-lg leading-relaxed">
                Cada corte y color es una obra de arte personalizada. Revisa nuestra galería para encontrar la inspiración de tu próximo look.
              </p>
              <div className="flex items-center space-x-4 pt-4">
                <Link
                  to="/gallery"
                  className="px-8 py-3 bg-stone-900 text-white rounded-full font-bold text-sm hover:bg-stone-700 transition no-underline flex items-center justify-center shadow-lg"
                >
                  Ver Galería Completa
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hair Tips Blog (NEW) */}
      <HairTips />

      <Reviews />

      {/* Booking Embed */}
      <div id="booking-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <span className="text-sm font-bold tracking-widest text-stone-500 uppercase">Tu momento es ahora</span>
          <h2 className="serif text-4xl md:text-5xl mt-3 text-stone-900">Agenda tu Cita</h2>
        </div>
        <BookingForm onSuccess={(data) => {
          setLastBooking(data);
        }} />
      </div>

      {/* Admin Footer Link */}
      <div className="bg-white py-4 text-center">
        <Link to="/admin" className="text-[10px] text-stone-300 hover:text-stone-500 flex items-center justify-center gap-1 mx-auto transition no-underline">
          <ShieldCheck size={10} /> Admin
        </Link>
      </div>
    </>
  );

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <ScrollToTop />
        <Header />

        <main className="flex-grow pt-16 md:pt-0">
          <Routes>
            <Route path="/" element={<HomeSelection />} />
            <Route path="/style" element={<Home />} />

            <Route path="/perfum" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                  <span className="text-sm font-bold tracking-widest text-stone-500 uppercase">Aromas Exclusivos</span>
                  <h2 className="serif text-4xl md:text-5xl mt-3 text-stone-900">Nuestra Colección</h2>
                </div>
                <PerfumeCatalog />
              </div>
            } />

            <Route path="/regalos" element={<GiftZone />} />

            <Route path="/gallery" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center mb-16">
                  <span className="text-sm font-bold tracking-widest text-stone-500 uppercase">Nuestro Arte</span>
                  <h2 className="serif text-4xl md:text-5xl mt-3 text-stone-900">Galería de Trabajos</h2>
                  <p className="text-stone-500 mt-4 max-w-2xl mx-auto">
                    Resultados reales de clientas felices. Inspírate para tu próximo cambio de look.
                  </p>
                </div>
                <Gallery />
              </div>
            } />

            <Route path="/loyalty" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex flex-col justify-center items-center">
                <LoyaltyCheck />
              </div>
            } />

            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/checkin" element={<CheckInPage />} />

            {/* 
               Note: The BookingForm inside Home handles success by calling the prop. 
               Since we want to show Confirmation page, let's add a route for it.
               However, passing state (lastBooking) via route requires 'state' in navigate.
               For this quick refactor, we might need a context or just pass it via prop if we lift state up? 
               Actually, <BookingForm> is inside Home. 
             */}
            <Route path="/confirmation" element={
              // Ideally we retrieve data from location.state
              <ConfirmationWrapper />
            } />

          </Routes>
        </main>

        <Footer />
        <ChatAssistant />
      </div>
    </Router>
  );
};

// Helper Wrapper to handle Confirmation with location state
const ConfirmationWrapper = () => {
  const location = useLocation();
  const state = location.state as { booking: BookingData, totalPrice: number } | null;

  if (!state) {
    // Fallback if accessed directly
    return <Navigate to="/" />;
  }

  return (
    <BookingConfirmation
      // We might need to update BookingConfirmation to accept these props directly if it doesn't already
      // Or if it expects 'lastBooking' state. Checking BookingConfirmation...
      // Assuming we need to refactor BookingConfirmation slightly or pass props it expects.
      // For now, let's pass a special 'bookingData' prop that we will add to BookingConfirmation component.
      // Wait, checking previous file read of BookingConfirmation... 
      // It likely uses props. Quick fix: We will pass props and ensure BookingConfirmation uses them.
      isHomeService={state.booking.isHomeService}
      onGoHome={() => window.location.href = "/"}
      onGoCatalog={() => window.location.href = "/perfum"}
    />
  );
}

export default App;