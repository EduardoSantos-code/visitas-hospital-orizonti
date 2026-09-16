export interface Visita {
  id: string;
  nome: string;
  telefone: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
  created_at?: string;
}

export interface AgendamentoRequest {
  nome: string;
  telefone: string;
  data: string; // YYYY-MM-DD
  horario: string; // HH:MM
}

export interface DayOccupancy {
  data: string;
  count: number;
  isFull: boolean;
  visitas: Visita[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
