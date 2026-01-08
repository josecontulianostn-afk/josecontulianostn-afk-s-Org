import React, { useState } from 'react';
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
import { Scissors, ShoppingBag, ArrowRight, Gift, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [lastBooking, setLastBooking] = useState<BookingData | null>(null);

  const renderView = () => {
    switch (currentView) {
      case ViewState.ADMIN:
        return <AdminPanel />;
      case ViewState.GALLERY:
        return (
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
        );
      case ViewState.LOYALTY:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 min-h-[60vh] flex flex-col justify-center items-center">
            <LoyaltyCheck />
          </div>
        );
      case ViewState.BOOKING:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest text-stone-500 uppercase">Reserva tu momento</span>
              <h2 className="serif text-4xl md:text-5xl mt-3 text-stone-900">Agenda tu Cita</h2>
            </div>
            <BookingForm onSuccess={(data) => {
              setLastBooking(data);
              setCurrentView(ViewState.CONFIRMATION);
            }} />
          </div>
        );
      case ViewState.CONFIRMATION:
        return (
          <BookingConfirmation
            isHomeService={lastBooking?.isHomeService || false}
            onGoHome={() => setCurrentView(ViewState.HOME)}
            onGoCatalog={() => setCurrentView(ViewState.CATALOG)}
          />
        );
      case ViewState.CATALOG:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest text-stone-500 uppercase">Aromas Exclusivos</span>
              <h2 className="serif text-4xl md:text-5xl mt-3 text-stone-900">Nuestra Colección</h2>
            </div>
            <PerfumeCatalog />
          </div>
        );
      case ViewState.HOME:
      default:
        return (
          <>
            <Hero onCtaClick={() => setCurrentView(ViewState.BOOKING)} />

            {/* Intro Features */}
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  <div>
                    <img
                      src="/images/gallery/work_1.png"
                      alt="Hair Styling"
                      className="rounded-sm shadow-xl"
                      onError={(e) => {
                        // Fallback just in case local image fails in dev
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=800";
                      }}
                    />
                  </div>
                  <div className="space-y-6">
                    <h3 className="serif text-4xl text-stone-900">Corte, Color & Styling</h3>
                    <p className="text-stone-600 font-light text-lg leading-relaxed">
                      Desde cortes de puntas esenciales hasta cambios de look completos con coloración. Descubre nuestros nuevos servicios de verano 2026.
                    </p>
                    <div className="flex items-center space-x-4 pt-2">
                      <button
                        onClick={() => setCurrentView(ViewState.GALLERY)}
                        className="px-6 py-2 bg-stone-100 text-stone-900 rounded-full font-bold text-sm hover:bg-stone-200 transition"
                      >
                        Ver Galería
                      </button>
                      <div className="flex items-center space-x-2 text-stone-900 font-medium">
                        <Scissors size={20} />
                        <span>Desde $7.000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Loyalty Teaser */}
            <section className="py-16 bg-stone-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-[100px] opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <Gift className="mx-auto text-amber-400 mb-4 h-12 w-12" />
                <h2 className="serif text-3xl md:text-4xl mb-4">¿Ya eres Clienta?</h2>
                <p className="text-stone-300 max-w-lg mx-auto mb-8">
                  Revisa tus puntos acumulados y descubre cuánto te falta para tu **Descuento de la 5ta Visita**.
                </p>
                <button
                  onClick={() => setCurrentView(ViewState.LOYALTY)}
                  className="bg-white text-stone-900 px-8 py-3 rounded-full font-bold hover:bg-amber-50 transition shadow-lg"
                >
                  Revisar mis Puntos
                </button>
              </div>
            </section>


            <section className="py-24 bg-stone-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center flex-row-reverse">
                  <div className="order-2 md:order-1 space-y-6">
                    <h3 className="serif text-4xl text-stone-900">Alta Perfumería <br /> en Decants</h3>
                    <p className="text-stone-600 font-light text-lg leading-relaxed">
                      Accede a las fragancias más deseadas del mundo en formatos de 5 y 10 ml. La forma inteligente de coleccionar aromas y descubrir tu nueva firma olfativa.
                    </p>
                    <div className="flex items-center space-x-2 text-stone-900 font-medium pt-2">
                      <ShoppingBag size={20} />
                      <span>100% Originales</span>
                    </div>
                    <button
                      onClick={() => setCurrentView(ViewState.CATALOG)}
                      className="inline-flex items-center text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition mt-4"
                    >
                      Explorar Catálogo <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                  <div className="order-1 md:order-2">
                    <img
                      src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&q=80&w=800"
                      alt="Perfumes"
                      className="rounded-sm shadow-xl"
                    />
                  </div>
                </div>
              </div>
            </section>

            <Reviews />

            {/* Admin Footer Link */}
            <div className="bg-white py-4 text-center">
              <button onClick={() => setCurrentView(ViewState.ADMIN)} className="text-[10px] text-stone-300 hover:text-stone-500 flex items-center justify-center gap-1 mx-auto transition">
                <ShieldCheck size={10} /> Admin
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header currentView={currentView} onChangeView={setCurrentView} />

      <main className="flex-grow pt-16 md:pt-0">
        {renderView()}
      </main>

      <Footer />
      <ChatAssistant />
    </div>
  );
};

export default App;