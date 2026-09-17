export type TipoPresenca = "Visita" | "Acompanhante - Dia" | "Acompanhante - Noite";

export interface Visita {
  id: string;
  nome: string;
  telefone: string;
  data: string; // YYYY-MM-DD
  tipo: TipoPresenca;
  horario?: string; // HH:MM (Opcional / Histórico)
  created_at?: string;
}

export interface AgendamentoRequest {
  nome: string;
  telefone: string;
  data: string; // YYYY-MM-DD
  tipo: TipoPresenca;
  horario?: string;
}

export interface ResumoDiaInfo {
  countVisitas: number;
  hasAcompDia: boolean;
  hasAcompNoite: boolean;
  isFull: boolean;
}

export interface DayOccupancy {
  data: string;
  countVisitas: number;
  acompDia: Visita | null;
  acompNoite: Visita | null;
  isFull: boolean;
  visitas: Visita[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
