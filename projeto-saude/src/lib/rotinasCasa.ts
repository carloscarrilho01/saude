// Treinos em casa — dados estáticos (sem equipamento, peso do corpo).
//
// Conteúdo de ORIENTAÇÃO GERAL, não prescrição: exercícios básicos e comuns,
// cada um com uma versão mais fácil. Antes do lançamento, revisar com um
// profissional de educação física (mesma regra dos modelos alimentares, PRD §10.1).

export type ObjetivoTreino = "comecar" | "perder" | "manter";

export const OBJETIVOS_TREINO: { valor: ObjetivoTreino; nome: string; desc: string }[] = [
  { valor: "comecar", nome: "Começar do zero", desc: "Voltar a se mexer com segurança" },
  { valor: "perder", nome: "Perder peso", desc: "Mais movimento e gasto no dia" },
  { valor: "manter", nome: "Manter o corpo ativo", desc: "Força e disposição na rotina" },
];

export interface Exercicio {
  nome: string;
  /** Como fazer, em uma ou duas frases. */
  como: string;
  /** Versão mais fácil / sem impacto. */
  facil: string;
  /** Por tempo (segundos) ou por repetições. */
  segundos?: number;
  repeticoes?: number;
}

export interface Bloco {
  titulo: string;
  /** Quantas voltas no bloco. */
  voltas: number;
  /** Descanso entre exercícios (s). */
  descansoS: number;
  exercicios: Exercicio[];
}

export interface RotinaCasa {
  slug: string;
  nome: string;
  objetivo: ObjetivoTreino;
  minutos: number; // duração aproximada
  nivel: "iniciante" | "intermediário";
  resumo: string;
  blocos: Bloco[];
}

const aquecimento: Bloco = {
  titulo: "Aquecimento",
  voltas: 1,
  descansoS: 0,
  exercicios: [
    { nome: "Marcha parada", como: "Marche no lugar elevando os joelhos e balançando os braços.", facil: "Eleve menos os joelhos.", segundos: 60 },
    { nome: "Círculos de braço", como: "Braços abertos, faça círculos para a frente e depois para trás.", facil: "Círculos menores.", segundos: 30 },
    { nome: "Rotação de quadril", como: "Mãos na cintura, gire o quadril devagar para os dois lados.", facil: "Apoie uma mão na parede.", segundos: 30 },
  ],
};

const alongamento: Bloco = {
  titulo: "Volta à calma",
  voltas: 1,
  descansoS: 0,
  exercicios: [
    { nome: "Alongamento de coxa", como: "Em pé, segure um pé atrás, perto do glúteo. Troque de lado na metade.", facil: "Apoie a mão livre na parede.", segundos: 40 },
    { nome: "Alongamento de posterior", como: "Pés afastados, desça o tronco devagar em direção ao chão, sem forçar.", facil: "Mãos nas coxas, joelhos levemente dobrados.", segundos: 30 },
    { nome: "Respiração", como: "Em pé ou sentado, inspire pelo nariz em 4 tempos e solte em 6.", facil: "Faça sentado.", segundos: 40 },
  ],
};

export const ROTINAS_CASA: RotinaCasa[] = [
  {
    slug: "primeiros-movimentos",
    nome: "Primeiros movimentos",
    objetivo: "comecar",
    minutos: 15,
    nivel: "iniciante",
    resumo: "Exercícios simples, com cadeira e parede, para retomar o hábito sem sustos.",
    blocos: [
      aquecimento,
      {
        titulo: "Circuito",
        voltas: 2,
        descansoS: 30,
        exercicios: [
          { nome: "Sentar e levantar da cadeira", como: "Sente e levante de uma cadeira firme, sem usar as mãos se conseguir.", facil: "Use as mãos nos joelhos para ajudar.", repeticoes: 10 },
          { nome: "Flexão na parede", como: "Mãos na parede na altura do peito, dobre os cotovelos e empurre de volta.", facil: "Fique mais perto da parede.", repeticoes: 10 },
          { nome: "Ponte de glúteo", como: "Deitado, joelhos dobrados, suba o quadril e desça devagar.", facil: "Suba só até a metade.", repeticoes: 12 },
          { nome: "Elevação de panturrilha", como: "Em pé, suba na ponta dos pés e desça devagar.", facil: "Segure no encosto de uma cadeira.", repeticoes: 15 },
        ],
      },
      alongamento,
    ],
  },
  {
    slug: "circuito-em-casa",
    nome: "Circuito em casa",
    objetivo: "perder",
    minutos: 20,
    nivel: "iniciante",
    resumo: "Circuito contínuo para acelerar o coração, com opção sem impacto para quem mora em apartamento.",
    blocos: [
      aquecimento,
      {
        titulo: "Circuito",
        voltas: 3,
        descansoS: 20,
        exercicios: [
          { nome: "Polichinelo", como: "Abra e feche pernas e braços ao mesmo tempo, em ritmo constante.", facil: "Sem pular: um passo para o lado de cada vez.", segundos: 40 },
          { nome: "Agachamento", como: "Pés na largura dos ombros, desça como se fosse sentar e volte.", facil: "Agache até uma cadeira e levante.", segundos: 40 },
          { nome: "Escalador", como: "Mãos no chão, alterne os joelhos em direção ao peito.", facil: "Mãos num sofá ou mesa, movimento mais lento.", segundos: 30 },
          { nome: "Avanço alternado", como: "Dê um passo à frente, desça o joelho de trás perto do chão e volte. Alterne.", facil: "Passo menor e descida curta.", segundos: 40 },
          { nome: "Corrida parada", como: "Corra no lugar com passadas leves.", facil: "Marcha rápida no lugar.", segundos: 40 },
        ],
      },
      alongamento,
    ],
  },
  {
    slug: "forca-em-casa",
    nome: "Força em casa",
    objetivo: "manter",
    minutos: 25,
    nivel: "intermediário",
    resumo: "Pernas, braços e abdômen com o peso do corpo para manter força e postura.",
    blocos: [
      aquecimento,
      {
        titulo: "Força",
        voltas: 3,
        descansoS: 30,
        exercicios: [
          { nome: "Agachamento", como: "Desça devagar em 3 tempos e suba mais rápido.", facil: "Agache até uma cadeira.", repeticoes: 15 },
          { nome: "Flexão de braço", como: "Corpo reto, desça o peito perto do chão e empurre de volta.", facil: "Com os joelhos no chão ou mãos num sofá.", repeticoes: 10 },
          { nome: "Ponte de glúteo", como: "Suba o quadril, segure 2 segundos no alto e desça devagar.", facil: "Sem a pausa no alto.", repeticoes: 15 },
          { nome: "Superman", como: "Deitado de barriga para baixo, eleve braços e pernas juntos e desça.", facil: "Eleve só os braços, depois só as pernas.", repeticoes: 12 },
          { nome: "Prancha", como: "Apoie antebraços e pontas dos pés, corpo reto, abdômen firme.", facil: "Joelhos no chão.", segundos: 30 },
        ],
      },
      alongamento,
    ],
  },
  {
    slug: "mobilidade-10",
    nome: "Mobilidade de 10 minutos",
    objetivo: "manter",
    minutos: 10,
    nivel: "iniciante",
    resumo: "Para os dias de descanso ou depois de muito tempo sentado.",
    blocos: [
      {
        titulo: "Mobilidade",
        voltas: 1,
        descansoS: 0,
        exercicios: [
          { nome: "Gato e camelo", como: "De quatro apoios, arredonde as costas para cima e depois afunde devagar.", facil: "Faça sentado, com as mãos nos joelhos.", segundos: 60 },
          { nome: "Rotação de tronco", como: "Sentado, gire o tronco para um lado e para o outro, sem pressa.", facil: "Gire só até onde ficar confortável.", segundos: 60 },
          { nome: "Abertura de quadril", como: "Em pé, faça círculos grandes com o joelho para fora, de cada lado.", facil: "Segure numa cadeira.", segundos: 60 },
          { nome: "Alongamento de peito", como: "Mão na batente da porta, gire o corpo para o lado oposto. Troque na metade.", facil: "Braço mais baixo.", segundos: 60 },
          { nome: "Pescoço", como: "Incline a cabeça devagar para cada lado e para a frente.", facil: "Movimentos menores.", segundos: 40 },
        ],
      },
      alongamento,
    ],
  },
];

export const getRotina = (slug: string) => ROTINAS_CASA.find((r) => r.slug === slug);

/** Rotinas recomendadas para o objetivo, a mais adequada primeiro. */
export function recomendarRotinas(objetivo: ObjetivoTreino): RotinaCasa[] {
  const prioridade: Record<ObjetivoTreino, string[]> = {
    comecar: ["primeiros-movimentos", "mobilidade-10", "circuito-em-casa", "forca-em-casa"],
    perder: ["circuito-em-casa", "primeiros-movimentos", "forca-em-casa", "mobilidade-10"],
    manter: ["forca-em-casa", "circuito-em-casa", "mobilidade-10", "primeiros-movimentos"],
  };
  return prioridade[objetivo].map((s) => getRotina(s)!).filter(Boolean);
}

/** Passo a passo linear do treino guiado (exercícios e descansos). */
export interface Passo {
  tipo: "exercicio" | "descanso";
  bloco: string;
  volta: number;
  voltas: number;
  exercicio?: Exercicio;
  segundos?: number;
}

export function passosDaRotina(r: RotinaCasa): Passo[] {
  const passos: Passo[] = [];
  for (const b of r.blocos) {
    for (let v = 1; v <= b.voltas; v++) {
      b.exercicios.forEach((ex, i) => {
        passos.push({ tipo: "exercicio", bloco: b.titulo, volta: v, voltas: b.voltas, exercicio: ex, segundos: ex.segundos });
        const ultimo = v === b.voltas && i === b.exercicios.length - 1;
        if (b.descansoS > 0 && !ultimo) passos.push({ tipo: "descanso", bloco: b.titulo, volta: v, voltas: b.voltas, segundos: b.descansoS });
      });
    }
  }
  return passos;
}
