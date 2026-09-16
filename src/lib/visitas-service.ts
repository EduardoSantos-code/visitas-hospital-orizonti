import { Visita, AgendamentoRequest } from "./types";
import { MAX_VISITS_PER_DAY, VISITING_SLOTS } from "./constants";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";

// Mock store para ambiente local quando Supabase não estiver conectado
let mockVisitasStore: Visita[] = [
  {
    id: "demo-1",
    nome: "Maria Silva",
    telefone: "(31) 99876-5432",
    data: new Date().toISOString().split("T")[0],
    horario: "11:00",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    nome: "Carlos Eduardo",
    telefone: "(31) 98765-4321",
    data: new Date().toISOString().split("T")[0],
    horario: "15:00",
    created_at: new Date().toISOString(),
  },
];

export async function getVisitasPorData(data: string): Promise<Visita[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data: visitas, error } = await supabaseAdmin
      .from("visitas")
      .select("*")
      .eq("data", data)
      .order("horario", { ascending: true });

    if (error) {
      console.error("Erro ao buscar visitas no Supabase:", error);
      throw new Error("Falha ao buscar visitas do banco de dados.");
    }
    return visitas as Visita[];
  }

  // Fallback Local
  return mockVisitasStore.filter((v) => v.data === data);
}

export async function getResumoDias(datas: string[]): Promise<Record<string, { count: number; isFull: boolean }>> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data: visitas, error } = await supabaseAdmin
      .from("visitas")
      .select("data, horario")
      .in("data", datas);

    if (error) {
      console.error("Erro ao buscar resumo no Supabase:", error);
      throw new Error("Falha ao buscar resumo de visitas.");
    }

    const mapa: Record<string, number> = {};
    datas.forEach((d) => (mapa[d] = 0));

    (visitas || []).forEach((v: { data: string }) => {
      mapa[v.data] = (mapa[v.data] || 0) + 1;
    });

    const resultado: Record<string, { count: number; isFull: boolean }> = {};
    datas.forEach((d) => {
      const count = mapa[d] || 0;
      resultado[d] = {
        count,
        isFull: count >= MAX_VISITS_PER_DAY,
      };
    });

    return resultado;
  }

  // Fallback Local
  const resultado: Record<string, { count: number; isFull: boolean }> = {};
  datas.forEach((d) => {
    const count = mockVisitasStore.filter((v) => v.data === d).length;
    resultado[d] = {
      count,
      isFull: count >= MAX_VISITS_PER_DAY,
    };
  });

  return resultado;
}

export async function criarAgendamento(req: AgendamentoRequest): Promise<Visita> {
  const { nome, telefone, data, horario } = req;

  // 1. Validações básicas de formato
  if (!nome || nome.trim().length < 3) {
    throw new Error("Informe o nome completo do visitante (mínimo 3 caracteres).");
  }

  if (!telefone || telefone.trim().length < 8) {
    throw new Error("Informe um número de WhatsApp válido.");
  }

  if (!data || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error("Data inválida.");
  }

  if (!VISITING_SLOTS.includes(horario as any)) {
    throw new Error("Horário de visita fora do período permitido (11h às 20h).");
  }

  // 2. Validação Backend no Supabase / PostgreSQL
  if (isSupabaseConfigured && supabaseAdmin) {
    const { count, error: countErr } = await supabaseAdmin
      .from("visitas")
      .select("id", { count: "exact", head: true })
      .eq("data", data);

    if (countErr) {
      console.error("Erro na checagem de limite no Supabase:", countErr);
      throw new Error("Erro ao validar disponibilidade de vagas.");
    }

    if ((count || 0) >= MAX_VISITS_PER_DAY) {
      throw new Error("Limite atingido: O dia selecionado já possui 4 visitas confirmadas.");
    }

    const { data: slotExistente, error: slotErr } = await supabaseAdmin
      .from("visitas")
      .select("id")
      .eq("data", data)
      .eq("horario", horario)
      .maybeSingle();

    if (slotErr) {
      console.error("Erro na checagem de slot no Supabase:", slotErr);
      throw new Error("Erro ao verificar horário.");
    }

    if (slotExistente) {
      throw new Error(`O horário das ${horario} já foi reservado por outro visitante neste dia.`);
    }

    const { data: novaVisita, error: insertErr } = await supabaseAdmin
      .from("visitas")
      .insert({
        nome: nome.trim(),
        telefone: telefone.trim(),
        data,
        horario,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Erro ao inserir visita no Supabase:", insertErr);
      if (insertErr.code === "23505" || insertErr.message?.includes("uq_visita_data_horario")) {
        throw new Error(`O horário das ${horario} já foi reservado por outro visitante.`);
      }
      if (insertErr.message?.includes("LIMITE_EXCEDIDO")) {
        throw new Error("O limite máximo de 4 visitas por dia foi atingido.");
      }
      throw new Error("Falha ao salvar agendamento no banco de dados.");
    }

    return novaVisita as Visita;
  }

  // 3. Fallback Local
  const visitasDoDia = mockVisitasStore.filter((v) => v.data === data);
  if (visitasDoDia.length >= MAX_VISITS_PER_DAY) {
    throw new Error("Limite atingido: O dia selecionado já possui 4 visitas confirmadas.");
  }

  const slotOcupado = visitasDoDia.some((v) => v.horario === horario);
  if (slotOcupado) {
    throw new Error(`O horário das ${horario} já foi reservado por outro visitante neste dia.`);
  }

  const novaVisita: Visita = {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    nome: nome.trim(),
    telefone: telefone.trim(),
    data,
    horario,
    created_at: new Date().toISOString(),
  };

  mockVisitasStore.push(novaVisita);
  return novaVisita;
}

export async function excluirVisita(id: string): Promise<boolean> {
  if (!id) {
    throw new Error("ID da visita não informado.");
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    const { error } = await supabaseAdmin.from("visitas").delete().eq("id", id);
    if (error) {
      console.error("Erro ao excluir visita no Supabase:", error);
      throw new Error("Falha ao excluir visita do banco de dados.");
    }
    return true;
  }

  // Fallback Local
  const index = mockVisitasStore.findIndex((v) => v.id === id);
  if (index !== -1) {
    mockVisitasStore.splice(index, 1);
    return true;
  }
  return false;
}

export async function atualizarVisita(
  id: string,
  updates: { nome?: string; telefone?: string; data?: string; horario?: string }
): Promise<Visita> {
  if (!id) {
    throw new Error("ID da visita não informado.");
  }

  const { nome, telefone, data, horario } = updates;

  if (horario && !VISITING_SLOTS.includes(horario as any)) {
    throw new Error("Horário de visita fora do período permitido (11h às 20h).");
  }

  if (isSupabaseConfigured && supabaseAdmin) {
    // Buscar visita atual para comparar se a data ou horário mudou
    const { data: visitaAtual, error: getErr } = await supabaseAdmin
      .from("visitas")
      .select("*")
      .eq("id", id)
      .single();

    if (getErr || !visitaAtual) {
      throw new Error("Visita não encontrada.");
    }

    const novaData = data || visitaAtual.data;
    const novoHorario = horario || visitaAtual.horario;

    // Se o horário ou data mudaram, validar colisão
    if (novaData !== visitaAtual.data || novoHorario !== visitaAtual.horario) {
      // 1. Checar se o novo slot já está ocupado por OUTRA visita
      const { data: slotOcupado, error: slotErr } = await supabaseAdmin
        .from("visitas")
        .select("id")
        .eq("data", novaData)
        .eq("horario", novoHorario)
        .neq("id", id)
        .maybeSingle();

      if (slotErr) {
        throw new Error("Erro ao verificar disponibilidade do novo horário.");
      }

      if (slotOcupado) {
        throw new Error(`O horário das ${novoHorario} no dia ${novaData} já está ocupado por outro visitante.`);
      }

      // 2. Se a data mudou, checar limite de 4 visitas na nova data
      if (novaData !== visitaAtual.data) {
        const { count, error: countErr } = await supabaseAdmin
          .from("visitas")
          .select("id", { count: "exact", head: true })
          .eq("data", novaData);

        if (countErr) {
          throw new Error("Erro ao checar capacidade da nova data.");
        }

        if ((count || 0) >= MAX_VISITS_PER_DAY) {
          throw new Error(`A nova data (${novaData}) já atingiu o limite máximo de 4 visitas.`);
        }
      }
    }

    // Executar update
    const payload: any = {};
    if (nome) payload.nome = nome.trim();
    if (telefone) payload.telefone = telefone.trim();
    if (data) payload.data = data;
    if (horario) payload.horario = horario;

    const { data: visitaAtualizada, error: updateErr } = await supabaseAdmin
      .from("visitas")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      console.error("Erro ao atualizar visita no Supabase:", updateErr);
      throw new Error("Falha ao atualizar dados da visita.");
    }

    return visitaAtualizada as Visita;
  }

  // Fallback Local
  const visita = mockVisitasStore.find((v) => v.id === id);
  if (!visita) {
    throw new Error("Visita não encontrada.");
  }

  const novaData = data || visita.data;
  const novoHorario = horario || visita.horario;

  if (novaData !== visita.data || novoHorario !== visita.horario) {
    const slotOcupado = mockVisitasStore.some(
      (v) => v.id !== id && v.data === novaData && v.horario === novoHorario
    );
    if (slotOcupado) {
      throw new Error(`O horário das ${novoHorario} no dia ${novaData} já está ocupado por outro visitante.`);
    }

    if (novaData !== visita.data) {
      const count = mockVisitasStore.filter((v) => v.data === novaData).length;
      if (count >= MAX_VISITS_PER_DAY) {
        throw new Error(`A nova data (${novaData}) já atingiu o limite máximo de 4 visitas.`);
      }
    }
  }

  if (nome) visita.nome = nome.trim();
  if (telefone) visita.telefone = telefone.trim();
  if (data) visita.data = data;
  if (horario) visita.horario = horario;

  return { ...visita };
}
