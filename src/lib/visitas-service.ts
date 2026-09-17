import { Visita, AgendamentoRequest, TipoPresenca, ResumoDiaInfo } from "./types";
import { supabaseAdmin, isSupabaseConfigured } from "./supabase";

// Mock store para ambiente local quando Supabase não estiver conectado
let mockVisitasStore: Visita[] = [
  {
    id: "demo-1",
    nome: "Maria Silva",
    telefone: "(31) 99876-5432",
    data: new Date().toISOString().split("T")[0],
    tipo: "Visita",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    nome: "Carlos Eduardo",
    telefone: "(31) 98765-4321",
    data: new Date().toISOString().split("T")[0],
    tipo: "Acompanhante - Dia",
    created_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    nome: "Fernanda Costa",
    telefone: "(31) 97654-3210",
    data: new Date().toISOString().split("T")[0],
    tipo: "Acompanhante - Noite",
    created_at: new Date().toISOString(),
  },
];

export async function getVisitasPorData(data: string): Promise<Visita[]> {
  if (isSupabaseConfigured && supabaseAdmin) {
    const { data: visitas, error } = await supabaseAdmin
      .from("visitas")
      .select("*")
      .eq("data", data)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Erro ao buscar visitas no Supabase:", error);
      throw new Error("Falha ao buscar visitas do banco de dados.");
    }
    return (visitas || []).map((v) => ({
      ...v,
      tipo: (v.tipo as TipoPresenca) || "Visita",
    })) as Visita[];
  }

  // Fallback Local
  return mockVisitasStore.filter((v) => v.data === data);
}

export async function getResumoDias(datas: string[]): Promise<Record<string, ResumoDiaInfo>> {
  if (isSupabaseConfigured && supabaseAdmin) {
    let { data: visitas, error } = await supabaseAdmin
      .from("visitas")
      .select("data, tipo")
      .in("data", datas);

    if (error && (error.code === "42703" || error.message?.includes("tipo"))) {
      // Fallback gracioso se a migracao da coluna tipo no Supabase ainda nao tiver sido rodada pelo usuario
      const { data: fallbackVisitas, error: fallbackErr } = await supabaseAdmin
        .from("visitas")
        .select("data")
        .in("data", datas);

      if (!fallbackErr) {
        visitas = (fallbackVisitas || []).map((v: any) => ({ ...v, tipo: "Visita" }));
        error = null;
      }
    }

    if (error) {
      console.error("Erro ao buscar resumo no Supabase:", error);
      throw new Error("Falha ao buscar resumo de visitas.");
    }

    const resultado: Record<string, ResumoDiaInfo> = {};
    datas.forEach((d) => {
      resultado[d] = {
        countVisitas: 0,
        hasAcompDia: false,
        hasAcompNoite: false,
        isFull: false,
      };
    });

    (visitas || []).forEach((v: { data: string; tipo: string }) => {
      if (resultado[v.data]) {
        if (v.tipo === "Visita") {
          resultado[v.data].countVisitas += 1;
        } else if (v.tipo === "Acompanhante - Dia") {
          resultado[v.data].hasAcompDia = true;
        } else if (v.tipo === "Acompanhante - Noite") {
          resultado[v.data].hasAcompNoite = true;
        }
      }
    });

    datas.forEach((d) => {
      const item = resultado[d];
      item.isFull = item.countVisitas >= 4 && item.hasAcompDia && item.hasAcompNoite;
    });

    return resultado;
  }

  // Fallback Local
  const resultado: Record<string, ResumoDiaInfo> = {};
  datas.forEach((d) => {
    const doDia = mockVisitasStore.filter((v) => v.data === d);
    const countVisitas = doDia.filter((v) => v.tipo === "Visita").length;
    const hasAcompDia = doDia.some((v) => v.tipo === "Acompanhante - Dia");
    const hasAcompNoite = doDia.some((v) => v.tipo === "Acompanhante - Noite");

    resultado[d] = {
      countVisitas,
      hasAcompDia,
      hasAcompNoite,
      isFull: countVisitas >= 4 && hasAcompDia && hasAcompNoite,
    };
  });

  return resultado;
}

export async function criarAgendamento(req: AgendamentoRequest): Promise<Visita> {
  const { nome, telefone, data, tipo = "Visita", horario } = req;

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

  const tipoFinal: TipoPresenca =
    tipo === "Acompanhante - Dia"
      ? "Acompanhante - Dia"
      : tipo === "Acompanhante - Noite"
      ? "Acompanhante - Noite"
      : "Visita";

  // 2. Validação Backend no Supabase / PostgreSQL
  if (isSupabaseConfigured && supabaseAdmin) {
    if (tipoFinal === "Visita") {
      const { count, error: countErr } = await supabaseAdmin
        .from("visitas")
        .select("id", { count: "exact", head: true })
        .eq("data", data)
        .eq("tipo", "Visita");

      if (countErr) {
        throw new Error("Erro ao validar limite de visitas.");
      }
      if ((count || 0) >= 4) {
        throw new Error("Limite de visitas atingido: O dia selecionado já possui 4 visitas confirmadas.");
      }
    } else {
      const { data: acompExistente, error: acompErr } = await supabaseAdmin
        .from("visitas")
        .select("id")
        .eq("data", data)
        .eq("tipo", tipoFinal)
        .maybeSingle();

      if (acompErr) {
        throw new Error("Erro ao validar disponibilidade de acompanhante.");
      }
      if (acompExistente) {
        throw new Error(
          `A vaga de ${tipoFinal === "Acompanhante - Dia" ? "Acompanhante de Dia (08h-20h)" : "Acompanhante de Noite (20h-08h)"} já foi preenchida nesta data.`
        );
      }
    }

    const { data: novaVisita, error: insertErr } = await supabaseAdmin
      .from("visitas")
      .insert({
        nome: nome.trim(),
        telefone: telefone.trim(),
        data,
        tipo: tipoFinal,
        ...(horario ? { horario } : {}),
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Erro ao inserir agendamento no Supabase:", insertErr);
      if (insertErr.message?.includes("LIMITE_VISITAS_EXCEDIDO")) {
        throw new Error("O limite máximo de 4 visitas simultâneas por dia foi atingido.");
      }
      if (insertErr.message?.includes("LIMITE_ACOMPANHANTE_DIA_EXCEDIDO")) {
        throw new Error("A vaga de acompanhante de dia já está ocupada.");
      }
      if (insertErr.message?.includes("LIMITE_ACOMPANHANTE_NOITE_EXCEDIDO")) {
        throw new Error("A vaga de acompanhante de noite já está ocupada.");
      }
      throw new Error("Falha ao salvar agendamento no banco de dados.");
    }

    return { ...novaVisita, tipo: novaVisita.tipo || tipoFinal } as Visita;
  }

  // 3. Fallback Local
  const visitasDoDia = mockVisitasStore.filter((v) => v.data === data);
  if (tipoFinal === "Visita") {
    const countVisitas = visitasDoDia.filter((v) => v.tipo === "Visita").length;
    if (countVisitas >= 4) {
      throw new Error("Limite de visitas atingido: O dia selecionado já possui 4 visitas confirmadas.");
    }
  } else {
    const jaExisteAcomp = visitasDoDia.some((v) => v.tipo === tipoFinal);
    if (jaExisteAcomp) {
      throw new Error(
        `A vaga de ${tipoFinal === "Acompanhante - Dia" ? "Acompanhante de Dia (08h-20h)" : "Acompanhante de Noite (20h-08h)"} já está preenchida nesta data.`
      );
    }
  }

  const novaVisita: Visita = {
    id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    nome: nome.trim(),
    telefone: telefone.trim(),
    data,
    tipo: tipoFinal,
    ...(horario ? { horario } : {}),
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
  updates: { nome?: string; telefone?: string; data?: string; tipo?: TipoPresenca; horario?: string }
): Promise<Visita> {
  if (!id) {
    throw new Error("ID do agendamento não informado.");
  }

  const { nome, telefone, data, tipo, horario } = updates;

  if (isSupabaseConfigured && supabaseAdmin) {
    const { data: visitaAtual, error: getErr } = await supabaseAdmin
      .from("visitas")
      .select("*")
      .eq("id", id)
      .single();

    if (getErr || !visitaAtual) {
      throw new Error("Agendamento não encontrado.");
    }

    const novaData = data || visitaAtual.data;
    const novoTipo = tipo || visitaAtual.tipo;

    // Se o tipo ou a data mudaram, checar colisão da nova modalidade
    if (novaData !== visitaAtual.data || novoTipo !== visitaAtual.tipo) {
      if (novoTipo === "Visita") {
        const { count } = await supabaseAdmin
          .from("visitas")
          .select("id", { count: "exact", head: true })
          .eq("data", novaData)
          .eq("tipo", "Visita")
          .neq("id", id);

        if ((count || 0) >= 4) {
          throw new Error(`A data (${novaData}) já atingiu o limite de 4 visitas.`);
        }
      } else {
        const { data: acompOcupado } = await supabaseAdmin
          .from("visitas")
          .select("id")
          .eq("data", novaData)
          .eq("tipo", novoTipo)
          .neq("id", id)
          .maybeSingle();

        if (acompOcupado) {
          throw new Error(`A vaga de ${novoTipo} na data ${novaData} já está ocupada por outro acompanhante.`);
        }
      }
    }

    const payload: any = {};
    if (nome) payload.nome = nome.trim();
    if (telefone) payload.telefone = telefone.trim();
    if (data) payload.data = data;
    if (tipo) payload.tipo = tipo;
    if (horario !== undefined) payload.horario = horario;

    const { data: visitaAtualizada, error: updateErr } = await supabaseAdmin
      .from("visitas")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateErr) {
      console.error("Erro ao atualizar no Supabase:", updateErr);
      throw new Error("Falha ao atualizar agendamento.");
    }

    return { ...visitaAtualizada, tipo: visitaAtualizada.tipo || "Visita" } as Visita;
  }

  // Fallback Local
  const visita = mockVisitasStore.find((v) => v.id === id);
  if (!visita) {
    throw new Error("Agendamento não encontrado.");
  }

  const novaData = data || visita.data;
  const novoTipo = tipo || visita.tipo;

  if (novaData !== visita.data || novoTipo !== visita.tipo) {
    if (novoTipo === "Visita") {
      const count = mockVisitasStore.filter((v) => v.id !== id && v.data === novaData && v.tipo === "Visita").length;
      if (count >= 4) {
        throw new Error(`A data (${novaData}) já atingiu o limite de 4 visitas.`);
      }
    } else {
      const acompOcupado = mockVisitasStore.some((v) => v.id !== id && v.data === novaData && v.tipo === novoTipo);
      if (acompOcupado) {
        throw new Error(`A vaga de ${novoTipo} na data ${novaData} já está ocupada por outro acompanhante.`);
      }
    }
  }

  if (nome) visita.nome = nome.trim();
  if (telefone) visita.telefone = telefone.trim();
  if (data) visita.data = data;
  if (tipo) visita.tipo = tipo;
  if (horario !== undefined) visita.horario = horario;

  return { ...visita };
}
