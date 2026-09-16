"use client";

import React, { useState } from "react";
import { User, Phone, CalendarCheck, Clock, CheckCircle, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface BookingFormProps {
  selectedDate: string; // YYYY-MM-DD
  selectedSlot: string | null;
  onSubmit: (formData: { nome: string; telefone: string }) => Promise<void>;
  isSubmitting: boolean;
  isDayFull: boolean;
}

export function BookingForm({
  selectedDate,
  selectedSlot,
  onSubmit,
  isSubmitting,
  isDayFull,
}: BookingFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formatação em tempo real para máscara de telefone (BR: (XX) 9XXXX-XXXX)
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    setTelefone(value);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedSlot) {
      setErrorMessage("Por favor, selecione um horário livre acima antes de confirmar.");
      return;
    }

    if (!nome.trim() || nome.trim().length < 3) {
      setErrorMessage("Por favor, digite seu nome completo (mínimo 3 letras).");
      return;
    }

    const cleanPhone = telefone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMessage("Por favor, digite um número de WhatsApp válido com DDD.");
      return;
    }

    try {
      await onSubmit({ nome: nome.trim(), telefone });
    } catch (err: any) {
      setErrorMessage(err.message || "Não foi possível agendar a visita.");
    }
  };

  const formatDataBr = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  if (isDayFull) {
    return null; // O botão fica oculto ou desabilitado se o dia estiver esgotado
  }

  return (
    <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-teal-600" />
            Dados do Visitante
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Preencha para registrar sua visita no sistema</p>
        </div>

        {selectedSlot ? (
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-600" /> {formatDataBr(selectedDate)} às {selectedSlot}
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-semibold">
            Selecione o horário acima
          </span>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Campo Nome */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo do Visitante</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="Ex: Ana Maria Silva"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Campo WhatsApp */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp para Contato</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              required
              placeholder="(31) 99999-9999"
              value={telefone}
              onChange={handleTelefoneChange}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Botão de Confirmação */}
        <button
          type="submit"
          disabled={isSubmitting || !selectedSlot}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            !selectedSlot
              ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
              : isSubmitting
              ? "bg-teal-700 text-white cursor-wait"
              : "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-teal-600/20 active:scale-[0.99]"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Registrando Agendamento...</span>
            </>
          ) : (
            <>
              <span>Confirmar Visita</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

