"use client";

import React, { useState } from "react";
import { Heart, MapPin, Clock, Info, ShieldCheck, ShieldAlert, LogOut, KeyRound } from "lucide-react";
import { HOSPITAL_NAME, HOSPITAL_LOCATION } from "@/lib/constants";
import { HospitalInfoModal } from "./HospitalInfoModal";

interface HeaderProps {
  isAdminMode: boolean;
  onOpenAdminAuth: () => void;
  onLogoutAdmin: () => void;
}

export function Header({ isAdminMode, onOpenAdminAuth, onLogoutAdmin }: HeaderProps) {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <header className="w-full glass-panel sticky top-0 z-30 border-b border-teal-100/50 shadow-xs">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md shadow-teal-500/20 text-white shrink-0">
              <Heart className="w-5 h-5 fill-current animate-pulse-subtle" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                Agenda de Visitas
                {isAdminMode ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full shadow-xs animate-pulse">
                    <ShieldAlert className="w-3 h-3" /> Modo Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold bg-teal-50 text-teal-700 rounded-full border border-teal-200/60">
                    <ShieldCheck className="w-3 h-3 text-teal-600" /> Oficial
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="font-medium text-slate-700">{HOSPITAL_NAME}</span>
                <span className="text-slate-300">•</span>
                <span>{HOSPITAL_LOCATION}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowRules(true)}
              className="px-3 py-1.5 rounded-xl text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center gap-1 text-xs font-semibold border border-teal-200/50"
              title="Regras e Informações"
            >
              <Info className="w-4 h-4 text-teal-600" />
              <span className="hidden sm:inline">Regras</span>
            </button>

            {isAdminMode ? (
              <button
                onClick={onLogoutAdmin}
                className="px-3 py-1.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1 text-xs font-semibold border border-rose-200/60"
                title="Sair do Modo Administrador"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span className="hidden sm:inline">Sair Admin</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminAuth}
                className="px-3 py-1.5 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-1 text-xs font-semibold border border-amber-200/60"
                title="Acesso Administrador da Família"
              >
                <KeyRound className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {showRules && <HospitalInfoModal onClose={() => setShowRules(false)} />}
    </>
  );
}
