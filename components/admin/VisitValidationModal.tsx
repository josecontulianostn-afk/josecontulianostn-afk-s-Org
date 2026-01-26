import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { VisitRegistration } from '../../types';
import { X, Check, AlertCircle } from 'lucide-react';

interface VisitValidationModalProps {
    visit: VisitRegistration;
    onClose: () => void;
    onSuccess: () => void;
}

const VisitValidationModal: React.FC<VisitValidationModalProps> = ({ visit, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [countLoyalty, setCountLoyalty] = useState(true);
    const [error, setError] = useState('');

    const handleValidate = async () => {
        if (!notes.trim()) {
            setError('Debes ingresar qué servicio o producto se realizó.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data, error: rpcError } = await supabase.rpc('process_visit_validation', {
                registration_id: visit.id,
                new_status: 'approved',
                notes: notes,
                count_as_loyalty: countLoyalty
            });

            if (rpcError) throw rpcError;
            if (!data.success) throw new Error(data.message);

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error al validar visita');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!window.confirm('¿Seguro que quieres rechazar/eliminar esta visita?')) return;

        setLoading(true);
        try {
            const { error } = await supabase.rpc('process_visit_validation', {
                registration_id: visit.id,
                new_status: 'rejected',
                notes: 'Rechazada por admin',
                count_as_loyalty: false
            });

            if (error) throw error;
            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in-up">

                {/* Header */}
                <div className="bg-stone-900 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-amber-100 font-serif text-lg">Validar Visita</h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6 bg-stone-50 p-3 rounded-lg border border-stone-200">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                            {visit.client?.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-stone-800">{visit.client?.name}</p>
                            <p className="text-xs text-stone-500">{visit.client?.phone}</p>
                        </div>
                        <div className="ml-auto text-xs text-stone-400">
                            {new Date(visit.check_in_time).toLocaleTimeString()}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
                                Servicio Realizado / Compra
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ej: Corte Bob + Braiding o Compra Perfume Yara"
                                className="w-full border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none"
                                autoFocus
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="cntLoyalty"
                                checked={countLoyalty}
                                onChange={(e) => setCountLoyalty(e.target.checked)}
                                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 border-stone-300"
                            />
                            <label htmlFor="cntLoyalty" className="text-sm text-stone-700 cursor-pointer select-none">
                                Contar como visita válida para premios
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={handleReject}
                            disabled={loading}
                            className="px-4 py-3 border border-stone-300 text-stone-500 rounded-lg hover:bg-stone-100 transition font-medium text-sm"
                        >
                            Rechazar
                        </button>
                        <button
                            onClick={handleValidate}
                            disabled={loading}
                            className="flex-1 py-3 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition font-bold shadow-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    Validar y Sumar Puntos
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisitValidationModal;
