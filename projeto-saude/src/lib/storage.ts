// Camada de dados — isola a persistência do resto do app.
// HOJE: localStorage (frontend-first). DEPOIS: trocar esta implementação por
// Supabase sem mexer nos componentes, que só conhecem estas funções.

import type {
  MetaAgua,
  Perfil,
  RegistroAgua,
  OrigemRegistro,
  ItemDiario,
  Regime,
  RefeicaoPlanejada,
  ConclusaoRefeicao,
  ConfigLembretes,
  Clima,
  Recipiente,
  DiaConsumo,
} from "./tipos";
import { CONFIG_LEMBRETES_PADRAO } from "./lembretes";
import { metaComClimaDoDia } from "./hidratacao";
import { apagarTodasAsFotos, removerFotosDoRegime } from "./fotos";
import type { Caminhada } from "./caminhada";
import {
  META_ATIVIDADE_PADRAO,
  calcularConquistasAtividade,
  progressoSemana,
  unificarAtividades,
  type ConquistaAtividade,
  type MetaAtividade,
  type Treino,
} from "./treinos";
import type { ObjetivoTreino } from "./rotinasCasa";
import { inicioDaSemana, somarDias } from "./habitos";

const CHAVES = {
  perfil: "saude.perfil",
  meta: "saude.meta",
  registrosAgua: "saude.registrosAgua", // array completo; filtramos por dataLocal
  itensDiario: "saude.itensDiario",
  regimes: "saude.regimes",
  refeicoesPlanejadas: "saude.refeicoesPlanejadas",
  conclusoes: "saude.conclusoes",
  configLembretes: "saude.configLembretes",
  historicoMetas: "saude.historicoMetas", // RF-2.6: cada meta com validoDesde
  climaDoDia: "saude.climaDoDia", // { "YYYY-MM-DD": Clima }
  recipientes: "saude.recipientes",
  celebradoEm: "saude.celebradoEm", // data local da última celebração de meta
  resumoVisto: "saude.resumoVisto", // segunda-feira da semana cujo resumo foi fechado
  consentimentoFotos: "saude.consentimentoFotos", // ISO do aceite (fotos ficam só no aparelho)
  planoPendente: "saude.planoPendente", // plano recebido por link antes de existir perfil
  mural: "saude.mural", // mural no modo local (lib/mural/local.ts usa a mesma chave)
  apelidoMural: "saude.apelidoMural", // apelido público usado ao publicar
  caminhadas: "saude.caminhadas",
  caminhadaAtiva: "saude.caminhadaAtiva", // sessão em andamento (recupera após recarregar)
  consentimentoLocalizacao: "saude.consentimentoLocalizacao",
  treinos: "saude.treinos",
  metaAtividade: "saude.metaAtividade",
  objetivoTreino: "saude.objetivoTreino",
} as const;

const disponivel = () => typeof window !== "undefined";

// Pub/sub simples para a UI reagir a mudanças sem um state manager externo.
type Listener = () => void;
const listeners = new Set<Listener>();
let versao = 0;
export function assinar(fn: Listener): () => void {
  listeners.add(fn);
  // mudanças feitas em outra aba também atualizam esta
  const aoMudarOutraAba = (e: StorageEvent) => {
    if (e.key?.startsWith("saude.")) notificar();
  };
  if (disponivel()) window.addEventListener("storage", aoMudarOutraAba);
  return () => {
    listeners.delete(fn);
    if (disponivel()) window.removeEventListener("storage", aoMudarOutraAba);
  };
}
/** Contador que muda a cada escrita — usado por useSyncExternalStore. */
export function getVersao(): number {
  return versao;
}
function notificar() {
  versao++;
  listeners.forEach((fn) => fn());
}

function ler<T>(chave: string): T | null {
  if (!disponivel()) return null;
  try {
    const raw = window.localStorage.getItem(chave);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function escrever<T>(chave: string, valor: T) {
  if (!disponivel()) return;
  window.localStorage.setItem(chave, JSON.stringify(valor));
  notificar();
}

// --- utilidades ---

export function gerarId(): string {
  if (disponivel() && "randomUUID" in crypto) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

/** Fuso IANA do navegador, com fallback para São Paulo. */
export function fusoDoNavegador(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  } catch {
    return "America/Sao_Paulo";
  }
}

/** Data local "YYYY-MM-DD" no fuso informado (padrão: fuso do navegador). */
export function dataLocalHoje(fuso?: string): string {
  const tz = fuso || fusoDoNavegador();
  // en-CA formata como YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}

// --- Perfil ---

export function getPerfil(): Perfil | null {
  return ler<Perfil>(CHAVES.perfil);
}

export function salvarPerfil(perfil: Perfil) {
  escrever(CHAVES.perfil, perfil);
}

export function temPerfil(): boolean {
  return getPerfil() != null;
}

// --- Meta de hidratação ---

export function getMeta(): MetaAgua | null {
  return ler<MetaAgua>(CHAVES.meta);
}

/** Salva a meta vigente e a acrescenta ao histórico (RF-2.6). */
export function salvarMeta(meta: MetaAgua) {
  const historico = ler<MetaAgua[]>(CHAVES.historicoMetas) ?? [];
  if (!historico.length) {
    // primeira gravação com histórico: a meta anterior passa a valer "desde sempre"
    const anterior = getMeta();
    if (anterior) historico.push({ ...anterior, validoDesde: new Date(0).toISOString() });
  }
  historico.push(meta);
  if (disponivel()) window.localStorage.setItem(CHAVES.historicoMetas, JSON.stringify(historico));
  escrever(CHAVES.meta, meta);
}

/** Histórico de metas em ordem cronológica (inclui a vigente). */
export function getHistoricoMetas(): MetaAgua[] {
  const historico = ler<MetaAgua[]>(CHAVES.historicoMetas);
  if (historico?.length) return historico;
  const atual = getMeta();
  return atual ? [{ ...atual, validoDesde: new Date(0).toISOString() }] : [];
}

const META_PADRAO_ML = 2000;

function dataLocalDe(iso: string, fuso?: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: fuso || fusoDoNavegador() }).format(new Date(iso));
}

/** Meta que valia em um dia, antes do ajuste de clima do dia. */
function metaVigenteEm(dataLocal: string, historico: MetaAgua[], fuso?: string): MetaAgua | null {
  let vigente: MetaAgua | null = null;
  for (const m of historico) {
    if (dataLocalDe(m.validoDesde, fuso) <= dataLocal) vigente = m;
  }
  return vigente ?? historico[0] ?? null;
}

/** Meta efetiva (ml) de um dia: meta vigente + clima informado para o dia. */
export function metaDoDia(dataLocal?: string): number {
  const fuso = getPerfil()?.fuso;
  const dia = dataLocal || dataLocalHoje(fuso);
  const meta = metaVigenteEm(dia, getHistoricoMetas(), fuso);
  if (!meta) return META_PADRAO_ML;
  return metaComClimaDoDia(meta, getClimaDoDia(dia));
}

// --- Clima do dia (ajuste pontual, PRD §3.2: clima informado pelo usuário) ---

export function getClimaDoDia(dataLocal?: string): Clima | null {
  const dia = dataLocal || dataLocalHoje(getPerfil()?.fuso);
  return ler<Record<string, Clima>>(CHAVES.climaDoDia)?.[dia] ?? null;
}

/** Define (ou limpa, com null) o clima só para um dia. Guarda os últimos 400 dias. */
export function definirClimaDoDia(clima: Clima | null, dataLocal?: string) {
  const dia = dataLocal || dataLocalHoje(getPerfil()?.fuso);
  const mapa = { ...(ler<Record<string, Clima>>(CHAVES.climaDoDia) ?? {}) };
  if (clima) mapa[dia] = clima;
  else delete mapa[dia];
  const chaves = Object.keys(mapa).sort();
  for (const k of chaves.slice(0, Math.max(0, chaves.length - 400))) delete mapa[k];
  escrever(CHAVES.climaDoDia, mapa);
}

// --- Registros de água ---

function getTodosRegistros(): RegistroAgua[] {
  return ler<RegistroAgua[]>(CHAVES.registrosAgua) ?? [];
}

/** Registros de um dia específico (padrão: hoje), mais recentes primeiro. */
export function getRegistrosAgua(dataLocal?: string): RegistroAgua[] {
  const dia = dataLocal || dataLocalHoje();
  return getTodosRegistros()
    .filter((r) => r.dataLocal === dia)
    .sort((a, b) => b.registradoEm.localeCompare(a.registradoEm));
}

/** Total consumido (ml) em um dia. */
export function totalAguaDia(dataLocal?: string): number {
  return getRegistrosAgua(dataLocal).reduce((soma, r) => soma + r.quantidadeMl, 0);
}

export function adicionarRegistroAgua(
  quantidadeMl: number,
  origem: OrigemRegistro = "botao_rapido",
): RegistroAgua {
  const fuso = getPerfil()?.fuso;
  const registro: RegistroAgua = {
    id: gerarId(),
    quantidadeMl,
    origem,
    registradoEm: new Date().toISOString(),
    dataLocal: dataLocalHoje(fuso),
  };
  escrever(CHAVES.registrosAgua, [...getTodosRegistros(), registro]);
  return registro;
}

export function removerRegistroAgua(id: string) {
  escrever(
    CHAVES.registrosAgua,
    getTodosRegistros().filter((r) => r.id !== id),
  );
}

export function editarRegistroAgua(id: string, quantidadeMl: number) {
  escrever(
    CHAVES.registrosAgua,
    getTodosRegistros().map((r) => (r.id === id ? { ...r, quantidadeMl } : r)),
  );
}

/**
 * Consumo diário dos últimos N dias (o último é hoje), com a meta que valia
 * em cada dia — base para gráficos, sequência e resumo semanal.
 */
export function consumoUltimosDias(n: number, fuso?: string): DiaConsumo[] {
  const tz = fuso || getPerfil()?.fuso;
  const porDia = new Map<string, number>();
  for (const r of getTodosRegistros()) porDia.set(r.dataLocal, (porDia.get(r.dataLocal) ?? 0) + r.quantidadeMl);
  const historico = getHistoricoMetas();
  const climas = ler<Record<string, Clima>>(CHAVES.climaDoDia) ?? {};
  const dias: DiaConsumo[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dia = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);
    const meta = metaVigenteEm(dia, historico, tz);
    dias.push({
      data: dia,
      totalMl: porDia.get(dia) ?? 0,
      metaMl: meta ? metaComClimaDoDia(meta, climas[dia]) : META_PADRAO_ML,
    });
  }
  return dias;
}

/** Totais de todo o histórico de água (para conquistas). */
export function estatisticasAgua(): { totalRegistros: number; totalMl: number } {
  const todos = getTodosRegistros();
  return { totalRegistros: todos.length, totalMl: todos.reduce((s, r) => s + r.quantidadeMl, 0) };
}

// --- Recipientes personalizados (RF-3.1: copo, garrafa personalizada) ---

export const RECIPIENTES_PADRAO: Recipiente[] = [
  { id: "padrao-copo", nome: "Copo", ml: 250, tipo: "copo" },
  { id: "padrao-garrafa", nome: "Garrafa", ml: 500, tipo: "garrafa" },
];

export function getRecipientes(): Recipiente[] {
  return ler<Recipiente[]>(CHAVES.recipientes) ?? RECIPIENTES_PADRAO;
}

export function adicionarRecipiente(dados: Omit<Recipiente, "id">): Recipiente {
  const novo = { ...dados, id: gerarId() };
  escrever(CHAVES.recipientes, [...getRecipientes(), novo]);
  return novo;
}

export function removerRecipiente(id: string) {
  escrever(CHAVES.recipientes, getRecipientes().filter((r) => r.id !== id));
}

// --- Celebração e resumo semanal (marcadores de UI) ---

export function getCelebradoEm(): string | null {
  return ler<string>(CHAVES.celebradoEm);
}
export function marcarCelebrado(dataLocal: string) {
  escrever(CHAVES.celebradoEm, dataLocal);
}
export function getResumoVisto(): string | null {
  return ler<string>(CHAVES.resumoVisto);
}
export function marcarResumoVisto(segunda: string) {
  escrever(CHAVES.resumoVisto, segunda);
}

// --- Diário alimentar ---

export function getTodosItensDiario(): ItemDiario[] {
  return ler<ItemDiario[]>(CHAVES.itensDiario) ?? [];
}

/** Itens de um dia (padrão: hoje), mais recentes primeiro. */
export function getItensDia(dataLocal?: string): ItemDiario[] {
  const dia = dataLocal || dataLocalHoje();
  return getTodosItensDiario()
    .filter((i) => i.dataLocal === dia)
    .sort((a, b) => a.registradoEm.localeCompare(b.registradoEm));
}

export type NovoItemDiario = Omit<ItemDiario, "id" | "registradoEm" | "dataLocal">;

export function adicionarItemDiario(dados: NovoItemDiario, dataLocal?: string): ItemDiario {
  const fuso = getPerfil()?.fuso;
  const item: ItemDiario = {
    ...dados,
    id: gerarId(),
    registradoEm: new Date().toISOString(),
    dataLocal: dataLocal || dataLocalHoje(fuso),
  };
  escrever(CHAVES.itensDiario, [...getTodosItensDiario(), item]);
  return item;
}

export function editarItemDiario(id: string, dados: Partial<NovoItemDiario>) {
  escrever(
    CHAVES.itensDiario,
    getTodosItensDiario().map((i) => (i.id === id ? { ...i, ...dados } : i)),
  );
}

export function removerItemDiario(id: string) {
  escrever(
    CHAVES.itensDiario,
    getTodosItensDiario().filter((i) => i.id !== id),
  );
}

// --- Regimes ---

export function getRegimes(): Regime[] {
  return (ler<Regime[]>(CHAVES.regimes) ?? []).sort((a, b) =>
    b.criadoEm.localeCompare(a.criadoEm),
  );
}

export function getRegime(id: string): Regime | undefined {
  return getRegimes().find((r) => r.id === id);
}

export function getRegimeAtivo(): Regime | undefined {
  return getRegimes().find((r) => r.status === "ativo");
}

export type NovoRegime = Omit<Regime, "id" | "criadoEm" | "status" | "ativadoEm" | "encerradoEm">;

export function criarRegime(dados: NovoRegime): Regime {
  const regime: Regime = {
    ...dados,
    id: gerarId(),
    status: "pausado",
    criadoEm: new Date().toISOString(),
  };
  escrever(CHAVES.regimes, [...getRegimes(), regime]);
  return regime;
}

export function atualizarRegime(id: string, dados: Partial<Regime>) {
  escrever(
    CHAVES.regimes,
    getRegimes().map((r) => (r.id === id ? { ...r, ...dados } : r)),
  );
}

/** Ativa um regime e pausa os demais (só um ativo por vez). */
export function ativarRegime(id: string) {
  const agora = new Date().toISOString();
  escrever(
    CHAVES.regimes,
    getRegimes().map((r) => {
      if (r.id === id) return { ...r, status: "ativo" as const, ativadoEm: agora };
      if (r.status === "ativo") return { ...r, status: "pausado" as const };
      return r;
    }),
  );
}

export function encerrarRegime(id: string) {
  atualizarRegime(id, { status: "encerrado", encerradoEm: new Date().toISOString() });
}

export function removerRegime(id: string) {
  void removerFotosDoRegime(id);
  escrever(
    CHAVES.regimes,
    getRegimes().filter((r) => r.id !== id),
  );
  // remove refeições planejadas do regime
  escrever(
    CHAVES.refeicoesPlanejadas,
    getTodasRefeicoesPlanejadas().filter((rp) => rp.regimeId !== id),
  );
}

// --- Refeições planejadas ---

function getTodasRefeicoesPlanejadas(): RefeicaoPlanejada[] {
  return ler<RefeicaoPlanejada[]>(CHAVES.refeicoesPlanejadas) ?? [];
}

const porOrdem = (a: RefeicaoPlanejada, b: RefeicaoPlanejada) =>
  a.ordem - b.ordem || a.horario.localeCompare(b.horario);

/** Refeições vigentes do plano (sem as removidas) — para listas e "hoje". */
export function getRefeicoesPlanejadas(regimeId: string): RefeicaoPlanejada[] {
  return getTodasRefeicoesPlanejadas()
    .filter((r) => r.regimeId === regimeId && !r.removidaEm)
    .sort(porOrdem);
}

/** Todas as refeições do plano, inclusive removidas — para aderência de dias passados. */
export function getRefeicoesPlanejadasComHistorico(regimeId: string): RefeicaoPlanejada[] {
  return getTodasRefeicoesPlanejadas()
    .filter((r) => r.regimeId === regimeId)
    .sort(porOrdem);
}

export type EdicaoRefeicao = Pick<RefeicaoPlanejada, "tipo" | "horario" | "descricao">;

/**
 * Salva a nova lista de refeições de um plano (PRD §3.5):
 * - existentes (com id): tipo/horário/descrição atualizados no lugar;
 * - novas (sem id): passam a contar a partir de hoje (`ativaDesde`);
 * - ausentes da lista: removidas a partir de hoje (`removidaEm`), sem apagar
 *   o histórico. Se foram criadas hoje e nunca valeram, são apagadas de vez.
 * A ordem final segue o horário.
 */
export function salvarRefeicoesDoPlano(
  regimeId: string,
  lista: (EdicaoRefeicao & { id?: string })[],
) {
  const hoje = dataLocalHoje(getPerfil()?.fuso);
  const ordenada = [...lista].sort((a, b) => a.horario.localeCompare(b.horario));
  const ordemDe = new Map(ordenada.map((r, i) => [r, i]));
  const editadas = new Map(lista.filter((r) => r.id).map((r) => [r.id as string, r]));

  const resultado: RefeicaoPlanejada[] = [];
  for (const r of getTodasRefeicoesPlanejadas()) {
    if (r.regimeId !== regimeId || r.removidaEm) {
      resultado.push(r);
      continue;
    }
    const ed = editadas.get(r.id);
    if (ed) {
      resultado.push({ ...r, tipo: ed.tipo, horario: ed.horario, descricao: ed.descricao, ordem: ordemDe.get(ed) ?? r.ordem });
    } else if (r.ativaDesde && r.ativaDesde >= hoje) {
      // criada hoje e removida no mesmo dia: nunca valeu, pode sumir
      continue;
    } else {
      resultado.push({ ...r, removidaEm: hoje });
    }
  }
  for (const nova of lista.filter((r) => !r.id)) {
    resultado.push({
      id: gerarId(),
      regimeId,
      tipo: nova.tipo,
      horario: nova.horario,
      descricao: nova.descricao,
      ordem: ordemDe.get(nova) ?? 0,
      ativaDesde: hoje,
    });
  }
  escrever(CHAVES.refeicoesPlanejadas, resultado);
}

export type NovaRefeicaoPlanejada = Omit<RefeicaoPlanejada, "id">;

export function adicionarRefeicaoPlanejada(dados: NovaRefeicaoPlanejada): RefeicaoPlanejada {
  const ref: RefeicaoPlanejada = { ...dados, id: gerarId() };
  escrever(CHAVES.refeicoesPlanejadas, [...getTodasRefeicoesPlanejadas(), ref]);
  return ref;
}

export function removerRefeicaoPlanejada(id: string) {
  escrever(
    CHAVES.refeicoesPlanejadas,
    getTodasRefeicoesPlanejadas().filter((r) => r.id !== id),
  );
}

// --- Conclusões de refeição ---

export function getTodasConclusoes(): ConclusaoRefeicao[] {
  return ler<ConclusaoRefeicao[]>(CHAVES.conclusoes) ?? [];
}

/** Alterna (marca/desmarca) a conclusão de uma refeição planejada num dia. */
export function alternarConclusao(refeicaoPlanejadaId: string, dataLocal?: string) {
  const dia = dataLocal || dataLocalHoje(getPerfil()?.fuso);
  const todas = getTodasConclusoes();
  const existente = todas.find(
    (c) => c.refeicaoPlanejadaId === refeicaoPlanejadaId && c.dataLocal === dia,
  );
  if (existente) {
    escrever(
      CHAVES.conclusoes,
      todas.map((c) =>
        c.id === existente.id
          ? { ...c, concluida: !c.concluida, concluidaEm: new Date().toISOString() }
          : c,
      ),
    );
  } else {
    const nova: ConclusaoRefeicao = {
      id: gerarId(),
      refeicaoPlanejadaId,
      dataLocal: dia,
      concluida: true,
      concluidaEm: new Date().toISOString(),
    };
    escrever(CHAVES.conclusoes, [...todas, nova]);
  }
}

// --- Lembretes ---

export function getConfigLembretes(): ConfigLembretes {
  const salvo = ler<Partial<ConfigLembretes>>(CHAVES.configLembretes);
  return { ...CONFIG_LEMBRETES_PADRAO, ...(salvo ?? {}) };
}

export function salvarConfigLembretes(config: ConfigLembretes) {
  escrever(CHAVES.configLembretes, config);
}

export function atualizarConfigLembretes(dados: Partial<ConfigLembretes>) {
  salvarConfigLembretes({ ...getConfigLembretes(), ...dados });
}

/** Registra que um lembrete acabou de ser disparado (dedup por intervalo). */
export function marcarLembreteDisparado(quando: string = new Date().toISOString()) {
  atualizarConfigLembretes({ ultimoLembreteEm: quando, adiadoAte: undefined });
}

/** Adia os lembretes por N minutos (snooze). */
export function adiarLembretes(minutos: number) {
  const ate = new Date(Date.now() + minutos * 60000).toISOString();
  atualizarConfigLembretes({ adiadoAte: ate });
}

// --- Privacidade (LGPD §4.1): exportar e excluir ---

export interface ExportacaoDados {
  formato: "orvalho.v1";
  exportadoEm: string;
  perfil: Perfil | null;
  meta: MetaAgua | null;
  registrosAgua: RegistroAgua[];
  itensDiario: ItemDiario[];
  regimes: Regime[];
  refeicoesPlanejadas: RefeicaoPlanejada[];
  conclusoes: ConclusaoRefeicao[];
  configLembretes: ConfigLembretes;
  historicoMetas: MetaAgua[];
  climaDoDia: Record<string, Clima>;
  recipientes: Recipiente[];
  muralLocal: unknown;
  apelidoMural: string | null;
  caminhadas: Caminhada[];
  treinos: Treino[];
  metaAtividade: MetaAtividade;
}

/** Reúne todos os dados do usuário num objeto legível (para download em JSON). */
export function exportarDados(): ExportacaoDados {
  return {
    formato: "orvalho.v1",
    exportadoEm: new Date().toISOString(),
    perfil: getPerfil(),
    meta: getMeta(),
    registrosAgua: getTodosRegistros(),
    itensDiario: getTodosItensDiario(),
    regimes: getRegimes(),
    refeicoesPlanejadas: ler<RefeicaoPlanejada[]>(CHAVES.refeicoesPlanejadas) ?? [],
    conclusoes: getTodasConclusoes(),
    configLembretes: getConfigLembretes(),
    historicoMetas: getHistoricoMetas(),
    climaDoDia: ler<Record<string, Clima>>(CHAVES.climaDoDia) ?? {},
    recipientes: getRecipientes(),
    muralLocal: ler<unknown>(CHAVES.mural),
    apelidoMural: getApelidoMural(),
    caminhadas: getCaminhadas(),
    treinos: getTreinos(),
    metaAtividade: getMetaAtividade(),
  };
}

/** Apaga tudo (usado em "sair"/reset de testes). */
export function limparTudo() {
  if (!disponivel()) return;
  void apagarTodasAsFotos();
  Object.values(CHAVES).forEach((c) => window.localStorage.removeItem(c));
  notificar();
}

// --- Modelos de regime (RF-5.7) ---

/** Cria um regime do usuário a partir de um modelo pronto (cópia independente). */
export function criarRegimeDeModelo(
  modelo: { nome: string; objetivo: Regime["objetivo"]; duracaoDias: number; refeicoes: { tipo: RefeicaoPlanejada["tipo"]; horario: string; descricao: string }[] },
  ativar: boolean,
): Regime {
  const regime = criarRegime({
    nome: modelo.nome,
    objetivo: modelo.objetivo,
    dataInicio: dataLocalHoje(getPerfil()?.fuso),
    duracaoDias: modelo.duracaoDias,
  });
  modelo.refeicoes.forEach((r, ordem) =>
    adicionarRefeicaoPlanejada({ regimeId: regime.id, tipo: r.tipo, horario: r.horario, descricao: r.descricao, ordem }),
  );
  if (ativar) ativarRegime(regime.id);
  return regime;
}

// --- Consentimento para fotos de progresso (LGPD) ---

export function getConsentimentoFotos(): string | null {
  return ler<string>(CHAVES.consentimentoFotos);
}
export function registrarConsentimentoFotos() {
  escrever(CHAVES.consentimentoFotos, new Date().toISOString());
}

// --- Plano recebido por link antes do onboarding ---

export function getPlanoPendente(): string | null {
  return ler<string>(CHAVES.planoPendente);
}
export function definirPlanoPendente(codigo: string | null) {
  if (!disponivel()) return;
  if (codigo) escrever(CHAVES.planoPendente, codigo);
  else {
    window.localStorage.removeItem(CHAVES.planoPendente);
    notificar();
  }
}

// --- Apelido público do mural ---

export function getApelidoMural(): string | null {
  return ler<string>(CHAVES.apelidoMural);
}
export function salvarApelidoMural(apelido: string) {
  escrever(CHAVES.apelidoMural, apelido);
}

// --- Caminhadas (GPS) — ficam só no aparelho ---

/** Mais recentes primeiro. */
export function getCaminhadas(): Caminhada[] {
  return (ler<Caminhada[]>(CHAVES.caminhadas) ?? []).sort((a, b) => b.inicioEm.localeCompare(a.inicioEm));
}
export function getCaminhada(id: string): Caminhada | undefined {
  return getCaminhadas().find((c) => c.id === id);
}
export function salvarCaminhada(c: Caminhada) {
  escrever(CHAVES.caminhadas, [c, ...getCaminhadas().filter((x) => x.id !== c.id)]);
}
export function removerCaminhada(id: string) {
  escrever(CHAVES.caminhadas, getCaminhadas().filter((c) => c.id !== id));
}
/** Apaga o percurso (coordenadas) e mantém só distância e tempo. */
export function apagarPercursoCaminhada(id: string) {
  escrever(CHAVES.caminhadas, getCaminhadas().map((c) => (c.id === id ? { ...c, trechos: [] } : c)));
}
export function getSessaoCaminhada<T>(): T | null {
  return ler<T>(CHAVES.caminhadaAtiva);
}
export function gravarSessaoCaminhada<T>(sessao: T | null) {
  if (!disponivel()) return;
  if (sessao) window.localStorage.setItem(CHAVES.caminhadaAtiva, JSON.stringify(sessao));
  else window.localStorage.removeItem(CHAVES.caminhadaAtiva);
}
export function getConsentimentoLocalizacao(): string | null {
  return ler<string>(CHAVES.consentimentoLocalizacao);
}
export function registrarConsentimentoLocalizacao() {
  escrever(CHAVES.consentimentoLocalizacao, new Date().toISOString());
}

// --- Treinos (registro manual + treinos em casa) ---

export function getTreinos(): Treino[] {
  return (ler<Treino[]>(CHAVES.treinos) ?? []).sort((a, b) => b.registradoEm.localeCompare(a.registradoEm));
}
export type NovoTreino = Omit<Treino, "id" | "registradoEm">;
export function adicionarTreino(dados: NovoTreino): Treino {
  const t: Treino = { ...dados, id: gerarId(), registradoEm: new Date().toISOString() };
  escrever(CHAVES.treinos, [t, ...getTreinos()]);
  return t;
}
export function removerTreino(id: string) {
  escrever(CHAVES.treinos, getTreinos().filter((t) => t.id !== id));
}

export function getMetaAtividade(): MetaAtividade {
  return ler<MetaAtividade>(CHAVES.metaAtividade) ?? META_ATIVIDADE_PADRAO;
}
export function salvarMetaAtividade(meta: MetaAtividade) {
  escrever(CHAVES.metaAtividade, meta);
}

export function getObjetivoTreino(): ObjetivoTreino | null {
  return ler<ObjetivoTreino>(CHAVES.objetivoTreino);
}
export function salvarObjetivoTreino(o: ObjetivoTreino) {
  escrever(CHAVES.objetivoTreino, o);
}

/** Todas as atividades (manuais + GPS), mais recentes primeiro. */
export function getAtividades() {
  return unificarAtividades(getTreinos(), getCaminhadas());
}

/** Progresso da semana atual (segunda a domingo, no fuso do usuário). */
export function progressoAtividadeSemana() {
  const hoje = dataLocalHoje(getPerfil()?.fuso);
  const segunda = inicioDaSemana(hoje);
  return { segunda, ...progressoSemana(getAtividades(), segunda, somarDias(segunda, 6), getMetaAtividade()) };
}

/** Conquistas de caminhada e treinos a partir de todo o histórico. */
export function conquistasAtividade(): ConquistaAtividade[] {
  const caminhadas = getCaminhadas();
  const atividades = getAtividades();
  const meta = getMetaAtividade();
  // semanas completas (ou a atual) em que a meta foi batida
  const semanas = new Set(atividades.map((a) => inicioDaSemana(a.dataLocal)));
  let semanasNaMeta = 0;
  for (const seg of semanas) if (progressoSemana(atividades, seg, somarDias(seg, 6), meta).bateu) semanasNaMeta++;
  return calcularConquistasAtividade({
    kmTotal: caminhadas.reduce((s, c) => s + c.distanciaM, 0) / 1000,
    maiorCaminhadaKm: Math.max(0, ...caminhadas.map((c) => c.distanciaM)) / 1000,
    qtdCaminhadas: caminhadas.length,
    qtdTreinos: atividades.length,
    semanasNaMeta,
  });
}
