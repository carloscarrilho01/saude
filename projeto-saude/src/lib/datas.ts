// Helpers de data/saudação no fuso do usuário.

function horaNoFuso(fuso?: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: fuso,
    hour: "numeric",
    hour12: false,
  });
  return parseInt(fmt.format(new Date()), 10);
}

export function saudacao(fuso?: string): string {
  const h = horaNoFuso(fuso);
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

/** "DOMINGO, 15 DE NOVEMBRO" (maiúsculas). */
export function dataExtenso(fuso?: string): string {
  const texto = new Intl.DateTimeFormat("pt-BR", {
    timeZone: fuso,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return texto.toUpperCase();
}
