import { NextRequest, NextResponse } from "next/server";
import {
  getVisitasPorData,
  getResumoDias,
  criarAgendamento,
  excluirVisita,
  atualizarVisita,
} from "@/lib/visitas-service";
import { MAX_VISITS_PER_DAY } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");
    const resumo = searchParams.get("resumo");
    const datasParam = searchParams.get("datas");

    if (resumo === "true" && datasParam) {
      const listadatas = datasParam.split(",").map((d) => d.trim());
      const resumoDados = await getResumoDias(listadatas);
      return NextResponse.json({ success: true, data: resumoDados });
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Parâmetro 'data' (YYYY-MM-DD) é obrigatório." },
        { status: 400 }
      );
    }

    const visitas = await getVisitasPorData(data);
    const count = visitas.length;
    const isFull = count >= MAX_VISITS_PER_DAY;

    return NextResponse.json({
      success: true,
      data: {
        data,
        count,
        max: MAX_VISITS_PER_DAY,
        isFull,
        visitas,
      },
    });
  } catch (error: any) {
    console.error("API GET /api/visitas Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Erro interno ao buscar visitas." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const novaVisita = await criarAgendamento(body);

    return NextResponse.json(
      {
        success: true,
        data: novaVisita,
        message: "Visita agendada com sucesso!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API POST /api/visitas Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Não foi possível concluir o agendamento." },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID da visita é obrigatório para exclusão." },
        { status: 400 }
      );
    }

    await excluirVisita(id);

    return NextResponse.json({
      success: true,
      message: "Visita cancelada com sucesso!",
    });
  } catch (error: any) {
    console.error("API DELETE /api/visitas Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Não foi possível cancelar a visita." },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID da visita é obrigatório para atualização." },
        { status: 400 }
      );
    }

    const visitaAtualizada = await atualizarVisita(id, updates);

    return NextResponse.json({
      success: true,
      data: visitaAtualizada,
      message: "Agendamento atualizado com sucesso!",
    });
  } catch (error: any) {
    console.error("API PATCH /api/visitas Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Não foi possível alterar a visita." },
      { status: 400 }
    );
  }
}
