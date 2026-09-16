"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Lock, CheckCircle2, AlertCircle } from "lucide-react";

interface DateSelectorProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  resumoDias: Record<string, { count: number; isFull: boolean }>;
}

export function DateSelector({ selectedDate, onSelectDate, resumoDias }: DateSelectorProps) {
  const [days, setDays] = useState<{ dateStr: string; dayName: string; dayNum: number; isToday: boolean }[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const list: { dateStr: string; dayName: string; dayNum: number; isToday: boolean }[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const dateStr = `${year}-${month}-${day}`;

      const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const dayName = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : dayNames[d.getDay()];

      list.push({
        dateStr,
        dayName,
        dayNum: d.getDate(),
        isToday: i === 0,
      });
    }

    setDays(list);
  }, []);

  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onSelectDate(e.target.value);
      setShowDatePicker(false);
    }
  };

  const formatDisplayDateHeader = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    const meses = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const semana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
    return `${semana[dateObj.getDay()]}, ${d} de ${meses[m - 1]}`;
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Header com data selecionada & botão de calendário */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">Selecione o Dia</span>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 capitalize">
            {formatDisplayDateHeader(selectedDate)}
          </h2>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-teal-600" />
            <span>Outras Datas</span>
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-10 z-40 bg-white p-3 rounded-2xl shadow-xl border border-slate-200 w-64 animate-in fade-in zoom-in-95 duration-150">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Escolher data específica:</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={handleCustomDateChange}
                className="w-full p-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 text-slate-800 font-medium"
              />
            </div>
          )}
        </div>
      </div>

      {/* Carrossel / Grid Horizontal dos 7 dias */}
      <div className="flex space-x-2 overflow-x-auto pb-1.5 pt-1 no-scrollbar scroll-smooth">
        {days.map((day) => {
          const isSelected = selectedDate === day.dateStr;
          const info = resumoDias[day.dateStr] || { count: 0, isFull: false };
          const isFull = info.isFull;

          return (
            <button
              key={day.dateStr}
              onClick={() => onSelectDate(day.dateStr)}
              className={`flex-shrink-0 flex flex-col items-center justify-between w-20 py-2.5 px-1.5 rounded-2xl border transition-all duration-200 relative ${
                isSelected
                  ? isFull
                    ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20 ring-2 ring-rose-400"
                    : "bg-teal-600 text-white border-teal-700 shadow-md shadow-teal-600/20 ring-2 ring-teal-400"
                  : isFull
                  ? "bg-rose-50/70 border-rose-200/80 text-rose-900 hover:bg-rose-100/80"
                  : "bg-white/90 border-slate-200 text-slate-700 hover:border-teal-300 hover:bg-teal-50/50"
              }`}
            >
              {/* Badge de Esgotado */}
              {isFull && (
                <span
                  className={`absolute -top-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-tight flex items-center gap-0.5 shadow-xs ${
                    isSelected
                      ? "bg-white text-rose-700"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  <Lock className="w-2.5 h-2.5" /> Esgotado
                </span>
              )}

              <span className={`text-[11px] font-medium uppercase tracking-tight ${
                isSelected ? "text-teal-100" : isFull ? "text-rose-600" : "text-slate-500"
              }`}>
                {day.dayName}
              </span>

              <span className={`text-lg font-bold my-0.5 ${
                isSelected ? "text-white" : isFull ? "text-rose-950" : "text-slate-800"
              }`}>
                {day.dayNum}
              </span>

              {/* Tag de Ocupação */}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isSelected
                  ? isFull
                    ? "bg-rose-700/60 text-white"
                    : "bg-teal-700/60 text-white"
                  : isFull
                  ? "bg-rose-200 text-rose-800"
                  : info.count === 0
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : "bg-slate-100 text-slate-600"
              }`}>
                {isFull ? "4 / 4" : `${info.count} / 4`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

