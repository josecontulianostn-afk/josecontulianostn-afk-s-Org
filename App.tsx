import React, { useState } from 'react';
import { ViewState } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import BookingForm from './components/BookingForm';
import PerfumeCatalog from './components/PerfumeCatalog';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import { Scissors, ShoppingBag, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);

  const renderView = () => {
    switch (currentView) {
      case ViewState.BOOKING:
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center mb-16">
              <span className="text-sm font-bold tracking-widest text-stone-500 uppercase">Reserva tu momento</span>
              <h2 className="serif text-4xl md:text-5xl mt-3 text-stone-900">Agenda tu Cita</h2>
            </div>
            <BookingForm onSuccess={() => setCurrentView(ViewState.HOME)} />
          </div>
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
                      src="https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=800"
                      alt="Hair Styling"
                      className="rounded-sm shadow-xl"
                    />
                  </div>
                  <div className="space-y-6">
                    <h3 className="serif text-4xl text-stone-900">Corte & Styling <br />a tu Medida</h3>
                    <p className="text-stone-600 font-light text-lg leading-relaxed">
                      Disfruta de una experiencia de salón completa sin salir de casa. Nuestro servicio exclusivo incluye lavado capilar, masaje relajante y un corte diseñado para resaltar tus facciones.
                    </p>
                    <div className="flex items-center space-x-2 text-stone-900 font-medium pt-2">
                      <Scissors size={20} />
                      <span>Desde $19.990</span>
                    </div>
                    <button
                      onClick={() => setCurrentView(ViewState.BOOKING)}
                      className="inline-flex items-center text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition mt-4"
                    >
                      Ver detalles y reservar <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                </div>
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