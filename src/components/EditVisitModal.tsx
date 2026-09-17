"use client";

import React, { useState } from "react";
import { Visita, TipoPresenca } from "@/lib/types";
import { X, Calendar, User, Phone, AlertCircle, Loader2, Save, UserCheck, HeartHandshake, Edit3 } from "lucide-react";

interface EditVisitModalProps {
  visita: Visita;
  visitasDoDia: Visita[];
  onClose: () => void;
  onSave: (id: string, updates: { tipo?: TipoPresenca; data?: string; nome?: string; telefone?: string }) => Promise<void>;
}

export function EditVisitModal({ visita, onClose, onSave }: EditVisitModalProps) {
  const [nome, setNome] = useState(visita.nome);
  const [telefone, setTelefone] = useState(visita.telefone);
  const [tipo, setTipo] = useState<TipoPresenca>(visita.tipo || "Visita");
  const [data, setData] = useState(visita.data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSave(visita.id, {
        nome: nome.trim(),
        telefone: telefone.trim(),
        data,
        tipo,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar alterações do agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Editar Agendamento</h3>
            <p className="text-xs text-slate-500">Altere a modalidade, data ou dados da pessoa</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Presença */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Modalidade</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setTipo("Visita")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                  tipo === "Visita"
                    ? "bg-teal-600 text-white border-teal-700 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Visita</span>
              </button>

              <button
                type="button"
                onClick={() => setTipo("Acompanhante - Dia")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                  tipo === "Acompanhante - Dia"
                    ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <span>Acomp. Dia</span>
              </button>

              <button
                type="button"
                onClick={() => setTipo("Acompanhante - Noite")}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-all ${
                  tipo === "Acompanhante - Noite"
                    ? "bg-indigo-600 text-white border-indigo-700 shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <span>Acomp. Noite</span>
              </button>
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Data */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Data</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-2xl text-xs hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
