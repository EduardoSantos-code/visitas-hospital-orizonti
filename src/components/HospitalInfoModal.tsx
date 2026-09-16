"use client";

import React from "react";
import { X, Clock, Users, ShieldAlert, MapPin, Phone, Car } from "lucide-react";
import { HOSPITAL_NAME, HOSPITAL_ADDRESS } from "@/lib/constants";

interface HospitalInfoModalProps {
  onClose: () => void;
}

export function HospitalInfoModal({ onClose }: HospitalInfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Regras de Visita</h3>
            <p className="text-xs text-slate-500">{HOSPITAL_NAME} • Belo Horizonte</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-3.5 bg-teal-50/80 rounded-2xl border border-teal-100 flex items-start gap-3">
            <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-teal-950">Horário Permitido</p>
              <p className="mt-0.5 text-teal-800">Das 11:00 às 20:00 (divididos em blocos de 1 hora).</p>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-100 flex items-start gap-3">
            <Users className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Limite Rigoroso por Dia</p>
              <p className="mt-0.5 text-amber-800">
                No máximo <strong>4 visitas por dia</strong>. Apenas 1 pessoa por horário de 1h para garantir o descanso.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Endereço</p>
                <p className="text-slate-500 mt-0.5">{HOSPITAL_ADDRESS}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/50">
              <Car className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Estacionamento</p>
                <p className="text-slate-500 mt-0.5">Disponível no local (estacionamento terceirizado).</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-100 flex items-center gap-2.5 text-rose-800">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <p className="text-[11px]">Se tiver sintomas gripais ou febre, remarque sua visita para proteção de todos.</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-2xl transition-colors shadow-md shadow-teal-600/20 text-sm"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
