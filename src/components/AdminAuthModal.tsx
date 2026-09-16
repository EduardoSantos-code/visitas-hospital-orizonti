"use client";

import React, { useState } from "react";
import { Lock, KeyRound, X, AlertCircle, ArrowRight } from "lucide-react";

interface AdminAuthModalProps {
  onClose: () => void;
  onAuthenticated: () => void;
}

export function AdminAuthModal({ onClose, onAuthenticated }: AdminAuthModalProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const expectedPin = process.env.NEXT_PUBLIC_ADMIN_PIN || "1234";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (pin.trim() === expectedPin.trim()) {
      onAuthenticated();
    } else {
      setError("PIN incorreto. Tente novamente (padrão: 1234).");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative space-y-4 animate-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
          <KeyRound className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="font-bold text-slate-800 text-base">Modo Administrador</h3>
          <p className="text-xs text-slate-500">
            Digite a senha/PIN da família para gerenciar, editar ou cancelar visitas.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">PIN / Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                autoFocus
                maxLength={10}
                placeholder="Ex: 1234"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-800 text-center tracking-widest placeholder:font-normal placeholder:tracking-normal placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              Dica: O PIN padrão de fábrica é <strong>1234</strong>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5"
          >
            <span>Entrar como Administrador</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
