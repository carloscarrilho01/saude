"use client";

// Gera a imagem para compartilhar uma caminhada (PNG 1080×1350).
// Leva distância, tempo, ritmo, data e — se a pessoa quiser — só a FORMA do
// percurso. Nunca mapa, endereço ou coordenadas.

import { desenharPercurso, formatarDuracao, formatarKm, formatarRitmo, ritmoSPorKm, type Caminhada } from "./caminhada";

const W = 1080;
const H = 1350;

export async function gerarImagemCaminhada(c: Caminhada, mostrarPercurso: boolean): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível gerar a imagem neste navegador.");
  const fonte = getComputedStyle(document.body).fontFamily || "sans-serif";

  // fundo verde da marca com brilho no topo
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1e6b4a");
  g.addColorStop(0.55, "#143d2b");
  g.addColorStop(1, "#0f2e21");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const brilho = ctx.createRadialGradient(W * 0.85, 0, 0, W * 0.85, 0, W * 0.9);
  brilho.addColorStop(0, "rgba(52,211,153,0.28)");
  brilho.addColorStop(1, "rgba(52,211,153,0)");
  ctx.fillStyle = brilho;
  ctx.fillRect(0, 0, W, H);

  // percurso
  const caixa = { x: 90, y: 150, w: W - 180, h: 600 };
  const caminhos = mostrarPercurso ? desenharPercurso(c.trechos, caixa.w, caixa.h, 30) : [];
  ctx.save();
  ctx.translate(caixa.x, caixa.y);
  if (caminhos.length) {
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(52,211,153,0.5)";
    ctx.shadowBlur = 24;
    for (const d of caminhos) ctx.stroke(new Path2D(d));
  } else {
    // sem percurso: gota grande da marca
    ctx.fillStyle = "rgba(52,211,153,0.18)";
    ctx.beginPath();
    ctx.arc(caixa.w / 2, caixa.h / 2, 220, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // números
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "alphabetic";
  ctx.font = `800 210px ${fonte}`;
  const km = formatarKm(c.distanciaM);
  ctx.fillText(km, 90, 1010);
  const largKm = ctx.measureText(km).width;
  ctx.font = `700 72px ${fonte}`;
  ctx.fillStyle = "#a7d8c4";
  ctx.fillText("km", 90 + largKm + 20, 1010);

  const colunas = [
    { rot: "Tempo", val: formatarDuracao(c.duracaoS) },
    { rot: "Ritmo", val: `${formatarRitmo(ritmoSPorKm(c.distanciaM, c.duracaoS))} /km` },
  ];
  colunas.forEach((col, i) => {
    const x = 90 + i * 470;
    ctx.fillStyle = "#a7d8c4";
    ctx.font = `600 40px ${fonte}`;
    ctx.fillText(col.rot.toUpperCase(), x, 1110);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 76px ${fonte}`;
    ctx.fillText(col.val, x, 1195);
  });

  // rodapé: data + marca
  const data = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" }).format(new Date(c.inicioEm));
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `500 38px ${fonte}`;
  ctx.fillText(`Caminhada · ${data}`, 90, 1280);
  ctx.textAlign = "right";
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 46px ${fonte}`;
  ctx.fillText("Orvalho", W - 90, 1280);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar a imagem."))), "image/png"),
  );
}

/** Compartilha (Web Share com arquivo) ou baixa a imagem. */
export async function compartilharCaminhada(c: Caminhada, mostrarPercurso: boolean): Promise<"compartilhado" | "baixado" | "cancelado"> {
  const blob = await gerarImagemCaminhada(c, mostrarPercurso);
  const arquivo = new File([blob], `caminhada-${c.dataLocal}.png`, { type: "image/png" });
  const texto = `${formatarKm(c.distanciaM)} km de caminhada com o Orvalho`;
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], text: texto });
      return "compartilhado";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelado";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = arquivo.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "baixado";
}
