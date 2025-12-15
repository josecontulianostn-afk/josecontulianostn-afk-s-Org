import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string}[]>([
    { role: 'bot', text: '¡Hola! Soy tu asistente de estilo. ¿Buscas un perfume especial o tienes dudas sobre el corte a domicilio?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMsg = inputText;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputText('');
    setIsLoading(true);

    const history = messages.map(m => `${m.role === 'user' ? 'Usuario' : 'Bot'}: ${m.text}`);
    const response = await sendMessageToGemini(userMsg, history);

    setMessages(prev => [...prev, { role: 'bot', text: response }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-stone-800 rotate-90' : 'bg-stone-900 rotate-0'}`}
      >
        {isOpen ? <X color="white" /> : <Sparkles color="white" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 h-[500px]">
          {/* Header */}
          <div className="bg-stone-900 p-4 flex items-center space-x-3">
             <div className="bg-stone-700 p-2 rounded-full">
                <Sparkles size={16} className="text-yellow-400" />
             </div>
             <div>
                <h3 className="text-white font-serif font-bold">Asistente Tus3B</h3>
                <p className="text-stone-400 text-xs">Te ayudo a elegir tu estilo</p>
             </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                        ? 'bg-stone-800 text-white rounded-br-none' 
                        : 'bg-white text-stone-800 border border-stone-200 rounded-bl-none shadow-sm'
                    }`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-stone-200 shadow-sm flex items-center space-x-2">
                        <Loader2 size={16} className="animate-spin text-stone-400" />
                        <span className="text-xs text-stone-400">Escribiendo...</span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-stone-100 flex items-center gap-2">
            <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Pregunta por perfumes o cortes..."
                className="flex-1 text-sm border-none focus:ring-0 bg-stone-100 rounded-full px-4 py-2 text-stone-800 placeholder-stone-400"
            />
            <button 
                onClick={handleSend}
                disabled={isLoading || !inputText.trim()}
                className="p-2 bg-stone-900 text-white rounded-full hover:bg-stone-700 disabled:opacity-50 transition"
            >
                <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatAssistant;