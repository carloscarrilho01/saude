// Tipos de domínio do Orvalho.
// Mantidos em um só lugar para a camada de dados e a UI compartilharem.

export type Sexo = "feminino" | "masculino" | "outro";

export type NivelAtividade = "sedentario" | "leve" | "moderado" | "intenso";

export type Clima = "ameno" | "quente" | "muito_quente";

export type UnidadePreferida = "ml" | "oz";

export type MetodoMeta = "auto" | "manual";

/** Perfil do usuário (dados que alimentam os cálculos). */
export interface Perfil {
  nome: string;
  pesoKg: number;
  alturaCm?: number;
  idade?: number;
  sexo?: Sexo;
  nivelAtividade: NivelAtividade;
  clima: Clima;
  unidade: UnidadePreferida;
  /** Fuso IANA, ex.: "America/Sao_Paulo". */
  fuso: string;
  criadoEm: string; // ISO
}

/** Meta de hidratação vigente (com histórico via valido_desde no storage). */
export interface MetaAgua {
  metaMl: number;
  metodo: MetodoMeta;
  coeficienteIdade: number;
  ajusteAtividadeMl: number;
  ajusteClimaMl: number;
  validoDesde: string; // ISO
}

export type OrigemRegistro = "botao_rapido" | "manual" | "outro";

/** Um registro de consumo de água. */
export interface RegistroAgua {
  id: string;
  quantidadeMl: number;
  origem: OrigemRegistro;
  registradoEm: string; // ISO (timestamp com fuso)
  dataLocal: string; // "YYYY-MM-DD" no fuso do usuário, para agrupar por dia
}

// --- Diário alimentar ---

export type TipoRefeicao = "cafe" | "almoco" | "lanche" | "jantar" | "outro";

export type Unidade = "g" | "ml" | "unidade" | "porcao" | "fatia" | "colher";

/** Um item ingerido, registrado manualmente (sem IA na v1). */
export interface ItemDiario {
  id: string;
  tipoRefeicao: TipoRefeicao;
  alimento: string;
  quantidade: number;
  unidade: Unidade;
  observacao?: string;
  calorias?: number;
  ehBebida: boolean;
  /** Liga o item à refeição planejada cumprida (alimenta a aderência). */
  refeicaoPlanejadaId?: string;
  registradoEm: string; // ISO
  dataLocal: string; // "YYYY-MM-DD"
}

// --- Regimes (planos alimentares) ---

export type ObjetivoRegime = "perder" | "manter" | "ganhar" | "hidratacao";

export type StatusRegime = "ativo" | "pausado" | "encerrado";

export interface RefeicaoPlanejada {
  id: string;
  regimeId: string;
  tipo: TipoRefeicao;
  horario: string; // "HH:MM"
  descricao: string;
  ordem: number;
  /** Data local a partir da qual conta na aderência (ausente = desde o início). */
  ativaDesde?: string;
  /** Data local em que foi removida; deixa de contar a partir dela (soft delete, PRD §3.5). */
  removidaEm?: string;
}

export interface Regime {
  id: string;
  nome: string;
  objetivo: ObjetivoRegime;
  dataInicio: string; // "YYYY-MM-DD"
  duracaoDias: number;
  metaCalorias?: number;
  status: StatusRegime;
  ativadoEm?: string; // ISO
  encerradoEm?: string; // ISO
  criadoEm: string; // ISO
}

/** Conclusão de uma refeição planejada em um dia específico. */
export interface ConclusaoRefeicao {
  id: string;
  refeicaoPlanejadaId: string;
  dataLocal: string; // "YYYY-MM-DD"
  concluida: boolean;
  concluidaEm?: string; // ISO
}

// --- Lembretes ---

/** 0 = Domingo … 6 = Sábado (compatível com Date.getDay). */
export type DiaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ConfigLembretes {
  ativo: boolean;
  intervaloMin: number; // ex.: 60, 90, 120
  horaInicio: string; // "HH:MM"
  horaFim: string; // "HH:MM"
  diasSemana: DiaSemana[];
  pausarAposMeta: boolean;
  snoozeMin: number;
  /** ISO do último lembrete disparado, para evitar duplicatas. */
  ultimoLembreteEm?: string;
  /** ISO até quando os lembretes estão adiados (snooze). */
  adiadoAte?: string;
}

// --- Hábitos (sequência, recipientes, ajuste do dia) ---

export type TipoRecipiente = "copo" | "garrafa" | "caneca";

/** Copo/garrafa personalizado do usuário para registro em 1 toque (RF-3.1). */
export interface Recipiente {
  id: string;
  nome: string;
  ml: number;
  tipo: TipoRecipiente;
}

/** Consumo de um dia com a meta que valia naquele dia. */
export interface DiaConsumo {
  data: string; // "YYYY-MM-DD"
  totalMl: number;
  metaMl: number;
}
