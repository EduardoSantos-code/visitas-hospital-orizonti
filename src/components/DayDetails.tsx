"use client";

import React, { useState } from "react";
import { Visita } from "@/lib/types";
import { VISITING_SLOTS, MAX_VISITS_PER_DAY } from "@/lib/constants";
import {
  Users,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  UserCheck,
  Trash2,
  Edit3,
  ShieldAlert,
} from "lucide-react";
import { EditVisitModal } from "./EditVisitModal";

interface DayDetailsProps {
  selectedDate: string;
  visitas: Visita[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  isLoading: boolean;
  isAdminMode: boolean;
  onDeleteVisit: (id: string, nome: string) => void;
  onUpdateVisit: (
    id: string,
    updates: { horario?: string; data?: string; nome?: string; telefone?: string }
  ) => Promise<void>;
}

export function DayDetails({
  selectedDate,
  visitas,
  selectedSlot,
  onSelectSlot,
  isLoading,
  isAdminMode,
  onDeleteVisit,
  onUpdateVisit,
}: DayDetailsProps) {
  const [editingVisita, setEditingVisita] = useState<Visita | null>(null);

  const count = visitas.length;
  const isFull = count >= MAX_VISITS_PER_DAY;
  const vagasRestantes = Math.max(0, MAX_VISITS_PER_DAY - count);

  // Mapear horários já ocupados
  const horariosOcupadosMap = new Map<string, Visita>();
  visitas.forEach((v) => {
    horariosOcupadosMap.set(v.horario, v);
  });

  return (
    <div className="w-full space-y-4">
      {/* 1. Contador de Ocupação do Dia */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isFull
            ? "bg-rose-50/80 border-rose-200/80 shadow-xs"
            : "bg-gradient-to-r from-teal-50/90 to-sky-50/90 border-teal-100/90 shadow-xs"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                isFull ? "bg-rose-100 text-rose-700" : "bg-teal-100 text-teal-700"
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Capacidade do Dia
              </h3>
              <p className="text-sm font-bold text-slate-800">
                {count} de {MAX_VISITS_PER_DAY} vagas preenchidas
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
              isFull
                ? "bg-rose-600 text-white"
                : vagasRestantes === 1
                ? "bg-amber-500 text-white animate-pulse"
                : "bg-emerald-600 text-white"
            }`}
          >
            {isFull ? (
              <>
                <Lock className="w-3.5 h-3.5" /> Dia Esgotado
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> {vagasRestantes}{" "}
                {vagasRestantes === 1 ? "vaga restante" : "vagas restantes"}
              </>
            )}
          </span>
        </div>

        {/* Barra de Progresso Visual (4 blocos) */}
        <div className="grid grid-cols-4 gap-1.5 mt-3">
          {Array.from({ length: MAX_VISITS_PER_DAY }).map((_, idx) => {
            const isFilled = idx < count;
            return (
              <div
                key={idx}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isFilled
                    ? isFull
                      ? "bg-rose-500 shadow-xs"
                      : "bg-teal-500 shadow-xs"
                    : "bg-slate-200/80"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* 2. Lista de Quem Já Agendou para este dia */}
      <div className="bg-white/95 p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-teal-600" /> Visitas Confirmadas neste dia
          </h3>
          {isAdminMode ? (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-amber-600" /> Modo Gerenciamento
            </span>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">Transparência familiar</span>
          )}
        </div>

        {isLoading ? (
          <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
            Carregando visitas confirmadas...
          </div>
        ) : visitas.length === 0 ? (
          <div className="py-5 px-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Nenhuma visita agendada para este dia ainda.
            </p>
            <p className="text-[11px] text-teal-600 font-semibold mt-0.5">
              Seja o primeiro a escolher o melhor horário!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visitas.map((visita) => (
              <div
                key={visita.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200/70 hover:border-teal-200 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center uppercase shrink-0">
                    {visita.nome.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate" title={visita.nome}>
                      {visita.nome}
                    </p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <span className="text-slate-600 font-semibold">{visita.telefone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-2.5 py-1 bg-teal-600 text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs">
                    <Clock className="w-3 h-3 text-teal-200" />
                    {visita.horario}
                  </div>

                  {/* AÇÕES DE ADMINISTRADOR */}
                  {isAdminMode && (
                    <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                      <button
                        onClick={() => setEditingVisita(visita)}
                        className="p-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                        title="Reagendar ou Editar"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onDeleteVisit(visita.id, visita.nome)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                        title="Cancelar Agendamento"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
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

      {/* 3. Seleção de Horários Disponíveis */}
      <div className="bg-white/95 p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" /> Selecione o Horário da Visita
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Visitas de 1h (Horário permitido: 11h às 20h)
            </p>
          </div>
        </div>

        {isFull ? (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-1">
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-1">
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-rose-900">Dia Totalmente Esgotado</p>
            <p className="text-[11px] text-rose-700">
              Já atingimos o limite de 4 visitas para este dia. Por favor, escolha outra data no seletor acima.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {VISITING_SLOTS.map((slot) => {
              const ocupadoPor = horariosOcupadosMap.get(slot);
              const isOccupied = Boolean(ocupadoPor);
              const isSelected = selectedSlot === slot;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => onSelectSlot(slot)}
                  className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    isOccupied
                      ? "bg-slate-100 border-slate-200/70 text-slate-400 cursor-not-allowed opacity-75"
                      : isSelected
                      ? "bg-teal-600 text-white border-teal-700 shadow-md shadow-teal-600/30 ring-2 ring-teal-400"
                      : "bg-white hover:bg-teal-50/70 border-slate-200 text-slate-700 hover:border-teal-300"
                  }`}
                >
                  <span className="text-xs font-bold flex items-center justify-center gap-1">
                    {slot}
                    {isOccupied && <Lock className="w-3 h-3 text-slate-400" />}
                  </span>
                  <span
                    className={`text-[9px] mt-0.5 font-medium truncate max-w-full px-1 ${
                      isOccupied
                        ? "text-slate-400 font-normal"
                        : isSelected
                        ? "text-teal-100 font-semibold"
                        : "text-emerald-600 font-semibold"
                    }`}
                  >
                    {isOccupied ? `Reservado (${ocupadoPor?.nome.split(" ")[0]})` : "Livre"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

