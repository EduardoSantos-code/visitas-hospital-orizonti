"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, MessageCircle, Calendar, User, Building2, X, HeartHandshake, UserCheck } from "lucide-react";
import { generateWhatsAppLink, HOSPITAL_NAME } from "@/lib/constants";
import { TipoPresenca } from "@/lib/types";

interface SuccessModalProps {
  nome: string;
  data: string; // YYYY-MM-DD
  tipo: TipoPresenca;
  onClose: () => void;
}

export function SuccessModal({ nome, data, tipo, onClose }: SuccessModalProps) {
  const [y, m, d] = data.split("-");
  const dataFormatted = `${d}/${m}/${y}`;
  const whatsappUrl = generateWhatsAppLink(nome, dataFormatted, tipo);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#0d9488", "#2dd4bf", "#38bdf8", "#0284c7", "#a855f7"],
      });
    } catch (e) {
      // Ignore
    }
  }, []);

  const isAcompanhante = tipo.startsWith("Acompanhante");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative text-center space-y-5 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ícone de Sucesso animado */}
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 ring-8 ring-emerald-50 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="px-3 py-1 bg-teal-50 text-teal-800 text-xs font-extrabold rounded-full border border-teal-200/80 inline-block mb-1 shadow-2xs">
            Agendamento Confirmado na Agenda!
          </span>
          <h2 className="text-xl font-black text-slate-800">Tudo pronto, {nome.split(" ")[0]}!</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto font-medium">
            Sua presença no {HOSPITAL_NAME} foi registrada com sucesso.
          </p>
        </div>

        {/* Card do Agendamento */}
        <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Building2 className="w-3.5 h-3.5 text-teal-600" /> Hospital
            </span>
            <span className="font-extrabold text-slate-800">{HOSPITAL_NAME} (BH)</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-teal-600" /> Data
            </span>
            <span className="font-extrabold text-slate-800">{dataFormatted}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <UserCheck className="w-3.5 h-3.5 text-teal-600" /> Modalidade
            </span>
            <span
              className={`font-extrabold px-2.5 py-0.5 rounded-lg border ${
                tipo === "Acompanhante - Dia"
                  ? "text-amber-800 bg-amber-50 border-amber-200"
                  : tipo === "Acompanhante - Noite"
                  ? "text-indigo-800 bg-indigo-50 border-indigo-200"
                  : "text-teal-700 bg-teal-50 border-teal-200/60"
              }`}
            >
              {tipo}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-semibold">
              <User className="w-3.5 h-3.5 text-teal-600" /> Pessoa
            </span>
            <span className="font-extrabold text-slate-800 truncate max-w-[170px]">{nome}</span>
          </div>
        </div>

        {/* BOTÃO GRANDE EM DESTAQUE - WHATSAPP */}
        <div className="pt-1 space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 group animate-pulse-subtle"
          >
            <MessageCircle className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
            <span>Notificar Família no WhatsApp</span>
          </a>

          <p className="text-[11px] text-slate-400 font-medium">
            Clique no botão para enviar uma mensagem formatada ao grupo da família.
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors pt-1"
        >
          Fechar janela
        </button>
      </div>
    </div>
  );
}

