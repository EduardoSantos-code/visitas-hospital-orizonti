"use client";

import React, { useState } from "react";
import { Visita, TipoPresenca } from "@/lib/types";
import {
  Users,
  Sun,
  Moon,
  UserCheck,
  Trash2,
  Edit3,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { EditVisitModal } from "./EditVisitModal";

interface DayDetailsProps {
  selectedDate: string;
  visitas: Visita[];
  isLoading: boolean;
  isAdminMode: boolean;
  onDeleteVisit: (id: string, nome: string) => void;
  onUpdateVisit: (
    id: string,
    updates: { tipo?: TipoPresenca; data?: string; nome?: string; telefone?: string }
  ) => Promise<void>;
}

export function DayDetails({
  selectedDate,
  visitas,
  isLoading,
  isAdminMode,
  onDeleteVisit,
  onUpdateVisit,
}: DayDetailsProps) {
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);

  const listaVisitas = visitas.filter((v) => v.tipo === "Visita");
  const acompDia = visitas.find((v) => v.tipo === "Acompanhante - Dia");
  const acompNoite = visitas.find((v) => v.tipo === "Acompanhante - Noite");

  const countVisitas = listaVisitas.length;

  return (
    <div className="w-full space-y-4">
      {/* SEÇÃO 1: TRANSPARÊNCIA FAMILIAR - RESUMO DO DIA */}
      <div className="bg-white/95 p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-teal-600" /> Transparência Familiar do Dia
          </h3>
          {isAdminMode && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-600" /> Modo Gerenciamento
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
            Carregando agenda do dia...
          </div>
        ) : (
          <div className="space-y-4">
            {/* --- BLOCO ACOMPANHANTES --- */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Acompanhantes
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Acompanhante Dia (08h às 20h) */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    acompDia
                      ? "bg-amber-50/80 border-amber-200"
                      : "bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                      <Sun className="w-4 h-4 text-amber-600" /> Turno Dia (08h - 20h)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        acompDia
                          ? "bg-amber-600 text-white"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {acompDia ? "Ocupado" : "Disponível"}
                    </span>
                  </div>

                  {acompDia ? (
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{acompDia.nome}</p>
                        <p className="text-[10px] text-slate-500">{acompDia.telefone}</p>
                      </div>
                      {isAdminMode && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingVisita(acompDia)}
                            className="p-1 rounded-lg bg-white border border-amber-200 text-amber-700 hover:bg-amber-100"
                            title="Editar"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteVisit(acompDia.id, acompDia.nome)}
                            className="p-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100"
                            title="Cancelar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-medium pt-1">
                      Nenhum acompanhante cadastrado para o turno do dia.
                    </p>
                  )}
                </div>

                {/* Acompanhante Noite (20h às 08h) */}
                <div
                  className={`p-3.5 rounded-2xl border transition-all ${
                    acompNoite
                      ? "bg-indigo-50/80 border-indigo-200"
                      : "bg-slate-50 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                      <Moon className="w-4 h-4 text-indigo-600" /> Turno Noite (20h - 08h)
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        acompNoite
                          ? "bg-indigo-600 text-white"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {acompNoite ? "Ocupado" : "Disponível"}
                    </span>
                  </div>

                  {acompNoite ? (
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{acompNoite.nome}</p>
                        <p className="text-[10px] text-slate-500">{acompNoite.telefone}</p>
                      </div>
                      {isAdminMode && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingVisita(acompNoite)}
                            className="p-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100"
                            title="Editar"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onDeleteVisit(acompNoite.id, acompNoite.nome)}
                            className="p-1 rounded-lg bg-white border border-rose-200 text-rose-700 hover:bg-rose-100"
                            title="Cancelar"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-medium pt-1">
                      Nenhum acompanhante cadastrado para o turno da noite.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* --- BLOCO VISITAS (MÁX 4) --- */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-teal-600" /> Visitas Confirmadas (11h às 20h)
                </h4>
                <span className="text-[11px] font-bold text-slate-700">
                  {countVisitas} / 4 vagas preenchidas
                </span>
              </div>

              {/* Barra de Progresso Visitas */}
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const isFilled = idx < countVisitas;
                  return (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all ${
                        isFilled ? "bg-teal-500" : "bg-slate-200"
                      }`}
                    />
                  );
                })}
              </div>

              {listaVisitas.length === 0 ? (
                <div className="py-3 px-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                  <p className="text-xs text-slate-500 font-medium">
                    Nenhuma visita registrada para este dia.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  {listaVisitas.map((visita) => (
                    <div
                      key={visita.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200/70 hover:border-teal-200 transition-all"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                          {visita.nome.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 truncate" title={visita.nome}>
                            {visita.nome}
                          </p>
                          <p className="text-[10px] text-slate-500 font-semibold">{visita.telefone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-teal-600 text-white rounded-lg text-[10px] font-bold">
                          Visita
                        </span>

                        {isAdminMode && (
                          <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                            <button
                              onClick={() => setEditingVisita(visita)}
                              className="p-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                              title="Editar"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>

                            <button
                              onClick={() => onDeleteVisit(visita.id, visita.nome)}
                              className="p-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                              title="Cancelar"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edição (Admin) */}
      {editingVisita && (
        <EditVisitModal
          visita={editingVisita}
          visitasDoDia={visitas}
          onClose={() => setEditingVisita(null)}
          onSave={onUpdateVisit}
        />
      )}
    </div>
  );
}

