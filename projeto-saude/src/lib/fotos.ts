// Fotos de progresso do regime — ficam SÓ neste aparelho (IndexedDB).
//
// Foto do corpo é dado pessoal sensível (LGPD): nada aqui sai do navegador,
// as imagens são reprocessadas num canvas (o que descarta EXIF/GPS) e reduzidas,
// e tudo entra em "exportar" e "excluir meus dados" (PRD §4.1).
// Quando o Supabase entrar, enviar fotos para a nuvem exige consentimento próprio.

export interface FotoProgresso {
  id: string;
  regimeId: string;
  dataLocal: string; // "YYYY-MM-DD"
  criadaEm: string; // ISO
  imagem: Blob; // JPEG reprocessado, sem metadados
  largura: number;
  altura: number;
  nota?: string;
}

export const BANCO_FOTOS = "orvalho-fotos";
const STORE = "fotos";
const LADO_MAXIMO = 1280;
const QUALIDADE_JPEG = 0.82;

// pub/sub para a UI recarregar quando as fotos mudam
const ouvintes = new Set<() => void>();
export function assinarFotos(fn: () => void): () => void {
  ouvintes.add(fn);
  return () => {
    ouvintes.delete(fn);
  };
}
const avisar = () => ouvintes.forEach((fn) => fn());

function disponivel(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(BANCO_FOTOS, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("regimeId", "regimeId");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function transacao<T>(modo: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  const db = await abrir();
  try {
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, modo);
      const req = fn(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req ? req.result : undefined);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close(); // fechar sempre: conexões abertas bloqueiam deleteDatabase
  }
}

/** Fotos de um regime, da mais antiga para a mais recente. */
export async function listarFotos(regimeId: string): Promise<FotoProgresso[]> {
  if (!disponivel()) return [];
  const fotos = (await transacao<FotoProgresso[]>("readonly", (s) => s.index("regimeId").getAll(regimeId))) ?? [];
  return fotos.sort((a, b) => a.criadaEm.localeCompare(b.criadaEm));
}

export async function todasAsFotos(): Promise<FotoProgresso[]> {
  if (!disponivel()) return [];
  return (await transacao<FotoProgresso[]>("readonly", (s) => s.getAll())) ?? [];
}

/**
 * Reduz a imagem e regrava como JPEG. Redesenhar no canvas descarta os
 * metadados do arquivo original (EXIF, inclusive localização GPS).
 */
export async function prepararImagem(arquivo: File): Promise<{ imagem: Blob; largura: number; altura: number }> {
  if (!arquivo.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  const bitmap = await createImageBitmap(arquivo, { imageOrientation: "from-image" });
  const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
  const largura = Math.round(bitmap.width * escala);
  const altura = Math.round(bitmap.height * escala);
  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem neste navegador.");
  ctx.drawImage(bitmap, 0, 0, largura, altura);
  bitmap.close();
  const imagem = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao gerar a imagem."))), "image/jpeg", QUALIDADE_JPEG),
  );
  return { imagem, largura, altura };
}

export async function adicionarFoto(dados: Omit<FotoProgresso, "id" | "criadaEm">): Promise<FotoProgresso> {
  const foto: FotoProgresso = {
    ...dados,
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `foto_${Date.now()}`,
    criadaEm: new Date().toISOString(),
  };
  await transacao("readwrite", (s) => s.put(foto));
  avisar();
  return foto;
}

export async function removerFoto(id: string) {
  await transacao("readwrite", (s) => s.delete(id));
  avisar();
}

export async function removerFotosDoRegime(regimeId: string) {
  const fotos = await listarFotos(regimeId);
  if (!fotos.length) return;
  await transacao("readwrite", (s) => {
    fotos.forEach((f) => s.delete(f.id));
  });
  avisar();
}

/** Apaga o banco inteiro (usado em "excluir todos os dados"). */
export function apagarTodasAsFotos(): Promise<void> {
  if (!disponivel()) return Promise.resolve();
  return new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(BANCO_FOTOS);
    req.onsuccess = req.onerror = req.onblocked = () => {
      avisar();
      resolve();
    };
  });
}

/** Converte para data URL — usado só na exportação dos dados. */
export function blobParaDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}
