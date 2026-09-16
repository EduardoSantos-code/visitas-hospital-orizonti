"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { DateSelector } from "@/components/DateSelector";
import { DayDetails } from "@/components/DayDetails";
import { BookingForm } from "@/components/BookingForm";
import { SuccessModal } from "@/components/SuccessModal";
import { AdminAuthModal } from "@/components/AdminAuthModal";
import { Visita } from "@/lib/types";
import { HOSPITAL_NAME, HOSPITAL_LOCATION } from "@/lib/constants";
import { Heart, HeartHandshake, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

export default function Home() {
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [resumoDias, setResumoDias] = useState<Record<string, { count: number; isFull: boolean }>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Estado do Modo Admin
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminAuth, setShowAdminAuth] = useState<boolean>(false);

  // Modal de sucesso pós-agendamento
  const [createdBooking, setCreatedBooking] = useState<{
    nome: string;
    data: string;
    horario: string;
  } | null>(null);

  // Verificar se já autenticou como admin no sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("is_admin_mode");
    if (saved === "true") {
      setIsAdminMode(true);
    }
  }, []);

  // Buscar visitas da data selecionada e resumo dos próximos 7 dias
  const fetchVisitaDados = useCallback(async (targetDate: string) => {
    setIsLoading(true);
    try {
      // 1. Visitas da data específica
      const res = await fetch(`/api/visitas?data=${targetDate}`);
      const data = await res.json();
      if (data.success) {
        setVisitas(data.data.visitas || []);
      }

      // 2. Resumo dos próximos 7 dias a partir de hoje
      const today = new Date();
      const datas7Dias: string[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        datas7Dias.push(d.toISOString().split("T")[0]);
      }

      const resResumo = await fetch(`/api/visitas?resumo=true&datas=${datas7Dias.join(",")}`);
      const dataResumo = await resResumo.json();
      if (dataResumo.success) {
        setResumoDias(dataResumo.data || {});
      }
    } catch (err) {
      console.error("Erro ao carregar visitas:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitaDados(selectedDate);
    setSelectedSlot(null);
  }, [selectedDate, fetchVisitaDados]);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleSelectSlot = (slot: string) => {
    setSelectedSlot(slot);
  };

  const handleBookingSubmit = async (formData: { nome: string; telefone: string }) => {
    if (!selectedSlot) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/visitas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: formData.nome,
          telefone: formData.telefone,
          data: selectedDate,
          horario: selectedSlot,
        }),
      });

      const responseData = await res.json();

      if (!res.ok || !responseData.success) {
        throw new Error(responseData.error || "Não foi possível realizar o agendamento.");
      }

      // Atualizar lista e abrir modal de sucesso
      setCreatedBooking({
        nome: formData.nome,
        data: selectedDate,
        horario: selectedSlot,
      });

      await fetchVisitaDados(selectedDate);
      setSelectedSlot(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Funções de Administração (Excluir e Editar)
  const handleDeleteVisit = async (id: string, nome: string) => {
    const confirm = window.confirm(`Tem certeza que deseja cancelar o agendamento de "${nome}"?`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/visitas?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao cancelar agendamento.");
      }

      await fetchVisitaDados(selectedDate);
    } catch (err: any) {
      alert(err.message || "Não foi possível cancelar a visita.");
    }
  };

  const handleUpdateVisit = async (
    id: string,
    updates: { horario?: string; data?: string; nome?: string; telefone?: string }
  ) => {
    const res = await fetch("/api/visitas", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Erro ao atualizar visita.");
    }

    await fetchVisitaDados(selectedDate);
  };

  const handleAdminAuthenticated = () => {
    setIsAdminMode(true);
    sessionStorage.setItem("is_admin_mode", "true");
    setShowAdminAuth(false);
  };

  const handleLogoutAdmin = () => {
    setIsAdminMode(false);
    sessionStorage.removeItem("is_admin_mode");
  };

  const isDayFull = visitas.length >= 4;

  return (
    <div className="w-full min-h-screen flex flex-col justify-between pb-10">
      <Header
        isAdminMode={isAdminMode}
        onOpenAdminAuth={() => setShowAdminAuth(true)}
        onLogoutAdmin={handleLogoutAdmin}
      />

      <main className="w-full max-w-xl mx-auto px-4 py-6 space-y-6 flex-grow">
        {/* Banner Acolhedor de Apresentação */}
        <div className="relative overflow-hidden p-5 rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-slate-800 text-white shadow-xl shadow-teal-700/15">
          <div className="relative z-10 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold text-teal-100 border border-white/20">
              <HeartHandshake className="w-3.5 h-3.5 text-teal-200" />
              <span>Espaço de Carinho e Apoio</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight leading-snug">
              Visitas ao Pai no {HOSPITAL_NAME}
            </h2>
            <p className="text-xs text-teal-100/90 leading-relaxed font-normal">
              Agende seu horário com facilidade. Para garantir o conforto e descanso, permitimos{" "}
              <strong className="text-white font-bold">no máximo 4 visitas por dia</strong>.
            </p>
          </div>

          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Banner de aviso do Modo Admin */}
        {isAdminMode && (
          <div className="p-3 bg-amber-500 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-between shadow-md">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-slate-950 shrink-0" />
              <span>Modo Gerenciamento Ativado (Você pode cancelar ou alterar horários)</span>
            </span>
            <button
              onClick={handleLogoutAdmin}
              className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-xl"
            >
              Sair
            </button>
          </div>
        )}

        {/* 1. Seletor de Datas */}
        <section className="space-y-2">
          <DateSelector
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            resumoDias={resumoDias}
          />
        </section>

        {/* 2. Detalhes do Dia */}
        <section className="space-y-4">
          <DayDetails
            selectedDate={selectedDate}
            visitas={visitas}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSelectSlot}
            isLoading={isLoading}
            isAdminMode={isAdminMode}
            onDeleteVisit={handleDeleteVisit}
            onUpdateVisit={handleUpdateVisit}
          />
        </section>

        {/* 3. Formulário de Agendamento */}
        {!isDayFull && (
          <section className="pt-2">
            <BookingForm
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onSubmit={handleBookingSubmit}
              isSubmitting={isSubmitting}
              isDayFull={isDayFull}
            />
          </section>
        )}
      </main>

      {/* Modal Autenticação Admin */}
      {showAdminAuth && (
        <AdminAuthModal
          onClose={() => setShowAdminAuth(false)}
          onAuthenticated={handleAdminAuthenticated}
        />
      )}

      {/* Modal de Sucesso com Botão de Notificação via WhatsApp */}
      {createdBooking && (
        <SuccessModal
          nome={createdBooking.nome}
          data={createdBooking.data}
          horario={createdBooking.horario}
          onClose={() => setCreatedBooking(null)}
        />
      )}

      {/* Rodapé Informativo */}
      <footer className="w-full max-w-xl mx-auto px-4 py-5 text-center text-xs text-slate-400 border-t border-slate-200/60 mt-4">
        <p className="flex items-center justify-center gap-1.5 font-semibold text-slate-600 text-xs">
          <Heart className="w-4 h-4 text-teal-600 fill-teal-600 animate-pulse-subtle" />
          Desenvolvido com carinho para a família & amigos
        </p>
        <p className="text-[11px] text-slate-400 font-medium mt-1">
          {HOSPITAL_NAME} • {HOSPITAL_LOCATION}
        </p>
      </footer>
    </div>
  );
}
