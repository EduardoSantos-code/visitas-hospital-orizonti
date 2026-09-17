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
export const HOSPITAL_ADDRESS = "Praça Engenheiro Flávio Gutierrez - Mangabeiras, Belo Horizonte - MG, 30210-080";

export const DEFAULT_FAMILY_WHATSAPP = "5531973647940";

export function getFamilyWhatsAppNumber(): string {
  const envNum = process.env.NEXT_PUBLIC_FAMILY_WHATSAPP_NUMBER;
  if (!envNum) return DEFAULT_FAMILY_WHATSAPP;
  // Clean non-digits
  const clean = envNum.replace(/\D/g, "");
  return clean.startsWith("55") ? clean : `55${clean}`;
}

export function formatWhatsAppMessage(nome: string, dataFormatted: string, tipo: string = "Visita"): string {
  let modalidade = "fazer uma visita (11h às 20h) ao";
  if (tipo === "Acompanhante - Dia") {
    modalidade = "ficar como acompanhante de dia (08h às 20h) do";
  } else if (tipo === "Acompanhante - Noite") {
    modalidade = "ficar como acompanhante de noite (20h às 08h) do";
  }

  const text = `Olá! Acabei de agendar para ${modalidade} Noel no Hospital Orizonti no dia ${dataFormatted}. (Nome: ${nome})`;
  return text;
}

export function generateWhatsAppLink(nome: string, dataFormatted: string, tipo: string = "Visita"): string {
  const phone = getFamilyWhatsAppNumber();
  const text = formatWhatsAppMessage(nome, dataFormatted, tipo);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
