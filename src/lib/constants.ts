export const MAX_VISITS_PER_DAY = 4;

export const VISITING_SLOTS = [
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
] as const;

export const HOSPITAL_NAME = "Hospital Orizonti";
export const HOSPITAL_LOCATION = "Belo Horizonte - MG";
export const HOSPITAL_ADDRESS = "R. Senador Milton Campos, 215 - Vila da Serra, Belo Horizonte - MG";

export const DEFAULT_FAMILY_WHATSAPP = "5531999999999";

export function getFamilyWhatsAppNumber(): string {
  const envNum = process.env.NEXT_PUBLIC_FAMILY_WHATSAPP_NUMBER;
  if (!envNum) return DEFAULT_FAMILY_WHATSAPP;
  // Clean non-digits
  const clean = envNum.replace(/\D/g, "");
  return clean.startsWith("55") ? clean : `55${clean}`;
}

export function formatWhatsAppMessage(nome: string, dataFormatted: string, horario: string): string {
  const text = `Olá! Acabei de agendar uma visita para ver seu pai no Hospital Orizonti no dia ${dataFormatted} às ${horario}. (Visitante: ${nome})`;
  return text;
}

export function generateWhatsAppLink(nome: string, dataFormatted: string, horario: string): string {
  const phone = getFamilyWhatsAppNumber();
  const text = formatWhatsAppMessage(nome, dataFormatted, horario);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
