"use client";

import React, { useState, useEffect } from "react";
import { User, Phone, CalendarCheck, AlertCircle, Loader2, ArrowRight, UserCheck, Sun, Moon } from "lucide-react";
import { Visita, TipoPresenca } from "@/lib/types";

interface BookingFormProps {
  selectedDate: string; // YYYY-MM-DD
  visitasDoDia: Visita[];
  onSubmit: (formData: { nome: string; telefone: string; tipo: TipoPresenca }) => Promise<void>;
  isSubmitting: boolean;
  isDayFull: boolean;
}

export function BookingForm({
  selectedDate,
  visitasDoDia,
  onSubmit,
  isSubmitting,
  isDayFull,
}: BookingFormProps) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [tipo, setTipo] = useState<TipoPresenca>("Visita");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const countVisitas = visitasDoDia.filter((v) => v.tipo === "Visita").length;
  const isVisitasFull = countVisitas >= 4;
  const isAcompDiaFull = visitasDoDia.some((v) => v.tipo === "Acompanhante - Dia");
  const isAcompNoiteFull = visitasDoDia.some((v) => v.tipo === "Acompanhante - Noite");

  // Ajustar opção selecionada se a atual estiver lotada
  useEffect(() => {
    if (tipo === "Visita" && isVisitasFull) {
      if (!isAcompDiaFull) setTipo("Acompanhante - Dia");
      else if (!isAcompNoiteFull) setTipo("Acompanhante - Noite");
    } else if (tipo === "Acompanhante - Dia" && isAcompDiaFull) {
      if (!isVisitasFull) setTipo("Visita");
      else if (!isAcompNoiteFull) setTipo("Acompanhante - Noite");
    } else if (tipo === "Acompanhante - Noite" && isAcompNoiteFull) {
      if (!isVisitasFull) setTipo("Visita");
      else if (!isAcompDiaFull) setTipo("Acompanhante - Dia");
    }
  }, [selectedDate, isVisitasFull, isAcompDiaFull, isAcompNoiteFull, tipo]);

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

    if (tipo === "Visita" && isVisitasFull) {
      setErrorMessage("As 4 vagas de visita para este dia já estão ocupadas.");
      return;
    }
    if (tipo === "Acompanhante - Dia" && isAcompDiaFull) {
      setErrorMessage("A vaga de acompanhante do dia (08h às 20h) já está ocupada.");
      return;
    }
    if (tipo === "Acompanhante - Noite" && isAcompNoiteFull) {
      setErrorMessage("A vaga de acompanhante da noite (20h às 08h) já está ocupada.");
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
      await onSubmit({ nome: nome.trim(), telefone, tipo });
    } catch (err: any) {
      setErrorMessage(err.message || "Não foi possível agendar.");
    }
  };

  const formatDataBr = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  if (isDayFull) {
    return null;
  }

  return (
    <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <CalendarCheck className="w-4 h-4 text-teal-600" />
            Registrar Presença
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Preencha seus dados para agendar na data escolhida</p>
        </div>

        <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 rounded-full text-xs font-bold flex items-center gap-1">
          {formatDataBr(selectedDate)}
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Escolha da Modalidade / Tipo de Presença */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Selecione a modalidade da sua presença:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Opção 1: Visita */}
            <button
              type="button"
              disabled={isVisitasFull}
              onClick={() => setTipo("Visita")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                isVisitasFull
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
                  : tipo === "Visita"
                  ? "bg-teal-600 text-white border-teal-700 shadow-md shadow-teal-600/20 ring-2 ring-teal-400"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <UserCheck className={`w-5 h-5 ${isVisitasFull ? "text-slate-400" : tipo === "Visita" ? "text-white" : "text-teal-600"}`} />
              <span className="text-xs font-bold">Visita</span>
              <span className={`text-[10px] ${isVisitasFull ? "text-slate-400" : tipo === "Visita" ? "text-teal-100" : "text-slate-500"}`}>
                {isVisitasFull ? "Esgotado (4/4)" : `11h-20h (${countVisitas}/4)`}
              </span>
            </button>

            {/* Opção 2: Acompanhante Dia */}
            <button
              type="button"
              disabled={isAcompDiaFull}
              onClick={() => setTipo("Acompanhante - Dia")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                isAcompDiaFull
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
                  : tipo === "Acompanhante - Dia"
                  ? "bg-amber-600 text-white border-amber-700 shadow-md shadow-amber-600/20 ring-2 ring-amber-400"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <Sun className={`w-5 h-5 ${isAcompDiaFull ? "text-slate-400" : tipo === "Acompanhante - Dia" ? "text-white" : "text-amber-600"}`} />
              <span className="text-xs font-bold">Acomp. Dia</span>
              <span className={`text-[10px] ${isAcompDiaFull ? "text-slate-400" : tipo === "Acompanhante - Dia" ? "text-amber-100" : "text-slate-500"}`}>
                {isAcompDiaFull ? "Preenchido" : "08h às 20h"}
              </span>
            </button>

            {/* Opção 3: Acompanhante Noite */}
            <button
              type="button"
              disabled={isAcompNoiteFull}
              onClick={() => setTipo("Acompanhante - Noite")}
              className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                isAcompNoiteFull
                  ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-70"
                  : tipo === "Acompanhante - Noite"
                  ? "bg-indigo-600 text-white border-indigo-700 shadow-md shadow-indigo-600/20 ring-2 ring-indigo-400"
                  : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
              }`}
            >
              <Moon className={`w-5 h-5 ${isAcompNoiteFull ? "text-slate-400" : tipo === "Acompanhante - Noite" ? "text-white" : "text-indigo-600"}`} />
              <span className="text-xs font-bold">Acomp. Noite</span>
              <span className={`text-[10px] ${isAcompNoiteFull ? "text-slate-400" : tipo === "Acompanhante - Noite" ? "text-indigo-100" : "text-slate-500"}`}>
                {isAcompNoiteFull ? "Preenchido" : "20h às 08h"}
              </span>
            </button>
          </div>
        </div>

        {/* Campo Nome */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Seu Nome Completo</label>
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
          disabled={isSubmitting}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
            isSubmitting
              ? "bg-teal-700 text-white cursor-wait"
              : "bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-teal-600/20 active:scale-[0.99]"
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Confirmando Agendamento...</span>
            </>
          ) : (
            <>
              <span>Confirmar Agendamento</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

