// Mural no Supabase (compartilhado). Depende de login (auth) para publicar,
// marcar útil, salvar e denunciar; ler é público. Contadores e ocultação por
// denúncias são mantidos por triggers no banco (supabase/schema.sql), nunca
// pelo cliente. NÃO TESTADO contra um projeto real: validar quando houver chaves.

import { getSupabase } from "../supabaseClient";
import type { RepositorioMural } from "./repositorio";
import type { NovaPublicacao, PlanoMural } from "./tipos";
import { ordenarMural, validarPublicacao } from "./regras";

interface Linha {
  id: string;
  autor_id: string;
  apelido: string;
  oficial: boolean;
  nome: string;
  descricao: string;
  objetivo: PlanoMural["objetivo"];
  duracao_dias: number;
  refeicoes: PlanoMural["refeicoes"];
  publicado_em: string;
  salvamentos: number;
  uteis: number;
}

const COLUNAS = "id, autor_id, apelido, oficial, nome, descricao, objetivo, duracao_dias, refeicoes, publicado_em, salvamentos, uteis";
const ouvintes = new Set<() => void>();
const avisar = () => ouvintes.forEach((fn) => fn());

function cliente() {
  const sb = getSupabase();
  if (!sb) throw new Error("Servidor indisponível.");
  return sb;
}

async function usuarioId(): Promise<string | null> {
  const { data } = await cliente().auth.getUser();
  return data.user?.id ?? null;
}

async function exigirLogin(): Promise<string> {
  const id = await usuarioId();
  if (!id) throw new Error("Entre na sua conta para participar do mural.");
  return id;
}

async function interacoes(uid: string | null, ids: string[]) {
  if (!uid || !ids.length) return { uteis: new Set<string>(), salvos: new Set<string>() };
  const sb = cliente();
  const [u, s] = await Promise.all([
    sb.from("mural_uteis").select("plano_id").eq("usuario_id", uid).in("plano_id", ids),
    sb.from("mural_salvamentos").select("plano_id").eq("usuario_id", uid).in("plano_id", ids),
  ]);
  return {
    uteis: new Set((u.data ?? []).map((r) => r.plano_id as string)),
    salvos: new Set((s.data ?? []).map((r) => r.plano_id as string)),
  };
}

function paraPlano(l: Linha, uid: string | null, uteis: Set<string>, salvos: Set<string>): PlanoMural {
  return {
    id: l.id,
    apelido: l.apelido,
    oficial: l.oficial,
    nome: l.nome,
    descricao: l.descricao,
    objetivo: l.objetivo,
    duracaoDias: l.duracao_dias,
    refeicoes: l.refeicoes,
    publicadoEm: l.publicado_em,
    salvamentos: l.salvamentos,
    uteis: l.uteis,
    meu: !!uid && l.autor_id === uid,
    marqueiUtil: uteis.has(l.id),
    salvei: salvos.has(l.id),
  };
}

export const muralSupabase: RepositorioMural = {
  modo: "nuvem",
  async listar(ordem) {
    const sb = cliente();
    let q = sb.from("mural_planos").select(COLUNAS).eq("status", "publicado").limit(100);
    q = ordem === "mais_salvos" ? q.order("salvamentos", { ascending: false }) : q.order("publicado_em", { ascending: false });
    const { data, error } = await q;
    if (error) throw new Error("Não foi possível carregar o mural.");
    const linhas = (data ?? []) as Linha[];
    const uid = await usuarioId();
    const { uteis, salvos } = await interacoes(uid, linhas.map((l) => l.id));
    return ordenarMural(linhas.map((l) => paraPlano(l, uid, uteis, salvos)), ordem);
  },
  async obter(id) {
    const { data, error } = await cliente().from("mural_planos").select(COLUNAS).eq("id", id).eq("status", "publicado").maybeSingle();
    if (error || !data) return null;
    const uid = await usuarioId();
    const { uteis, salvos } = await interacoes(uid, [id]);
    return paraPlano(data as Linha, uid, uteis, salvos);
  },
  async publicar(nova: NovaPublicacao) {
    const uid = await exigirLogin();
    const { dados, erros } = validarPublicacao(nova);
    if (Object.keys(erros).length) throw new Error(Object.values(erros)[0]);
    const { data, error } = await cliente()
      .from("mural_planos")
      .insert({
        autor_id: uid,
        apelido: dados.apelido,
        nome: dados.nome,
        descricao: dados.descricao,
        objetivo: dados.objetivo,
        duracao_dias: dados.duracaoDias,
        refeicoes: dados.refeicoes,
      })
      .select(COLUNAS)
      .single();
    if (error || !data) throw new Error("Não foi possível publicar agora. Tente de novo.");
    avisar();
    return paraPlano(data as Linha, uid, new Set(), new Set());
  },
  async removerMinha(id) {
    const uid = await exigirLogin();
    const { error } = await cliente().from("mural_planos").update({ status: "removido" }).eq("id", id).eq("autor_id", uid);
    if (error) throw new Error("Não foi possível remover.");
    avisar();
  },
  async alternarUtil(id) {
    const uid = await exigirLogin();
    const sb = cliente();
    const { data } = await sb.from("mural_uteis").select("plano_id").eq("plano_id", id).eq("usuario_id", uid).maybeSingle();
    const { error } = data
      ? await sb.from("mural_uteis").delete().eq("plano_id", id).eq("usuario_id", uid)
      : await sb.from("mural_uteis").insert({ plano_id: id, usuario_id: uid });
    if (error) throw new Error("Não foi possível registrar.");
    avisar();
  },
  async registrarSalvamento(id) {
    const uid = await exigirLogin();
    await cliente().from("mural_salvamentos").upsert({ plano_id: id, usuario_id: uid }, { ignoreDuplicates: true });
    avisar();
  },
  async denunciar(id, motivo) {
    const uid = await exigirLogin();
    const { error } = await cliente()
      .from("mural_denuncias")
      .upsert({ plano_id: id, usuario_id: uid, motivo }, { onConflict: "plano_id,usuario_id", ignoreDuplicates: true });
    if (error) throw new Error("Não foi possível enviar a denúncia.");
    avisar();
  },
  assinar(fn) {
    ouvintes.add(fn);
    return () => {
      ouvintes.delete(fn);
    };
  },
};
