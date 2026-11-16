# PRD — Sistema de Saúde & Hidratação ("Projeto Saúde")

| Campo | Valor |
|---|---|
| **Versão do documento** | 1.3 |
| **Data** | 15/11/2026 |
| **Autor** | Carlos |
| **Status** | Rascunho para revisão |
| **Plataforma** | **PWA** (web app instalável) **mobile-first**, rodando em desktop e celular — visual premium estilo iOS (ver §12) |
| **Modelo de usuário** | Multiusuário, cada pessoa com sua conta |
| **Escopo da v1 (MVP)** | Completo: cálculo de água, lembretes, regimes e registro de ingestão |
| **Referência visual** | `/imagens` — mockups aprovados (12 telas + dashboard premium) |

---

## 1. Visão geral

### 1.1 Problema
A maioria das pessoas não bebe a quantidade ideal de água por dia, não tem clareza do que ingeriu, e não consegue manter um regime (dieta/plano alimentar) de forma consistente. Falta uma ferramenta simples que una **meta personalizada de hidratação**, **lembretes ativos** e **registro do que foi consumido** no mesmo lugar.

### 1.2 Solução
Um web app onde o usuário cria sua conta, informa seus dados (peso, altura, idade, nível de atividade), recebe automaticamente uma **meta diária de água calculada pelo peso**, é **lembrado de beber água** ao longo do dia, pode **criar e seguir regimes** e **registrar tudo o que ingeriu** (água, refeições, bebidas), acompanhando seu progresso.

### 1.3 Objetivos do produto
- Facilitar que o usuário atinja sua meta diária de hidratação.
- Dar visibilidade do que foi ingerido no dia (água e alimentos).
- Permitir estruturar e seguir um regime/plano alimentar.
- Criar hábito através de lembretes e acompanhamento de progresso.

### 1.4 Não-objetivos (fora de escopo na v1)
- Contagem avançada de calorias por foto/IA de imagem.
- Integração com wearables (Apple Watch, Fitbit, etc.).
- Receitas e lista de compras.
- Rede social / comparação entre usuários.
- Prescrição médica ou diagnóstico (ver seção 11 — Disclaimer).

---

## 2. Público-alvo & Personas

**Persona 1 — Ana, 29 anos, quer criar hábito de beber água**
Esquece de se hidratar durante o trabalho. Quer saber quanto beber e ser lembrada.

**Persona 2 — Pedro, 35 anos, está fazendo um regime**
Quer registrar o que come, seguir um plano alimentar e ver se está no caminho certo.

**Persona 3 (futuro) — Profissional de saúde**
Nutricionista que acompanha pacientes. *Reservado para versão futura — ver roadmap.*

---

## 3. Funcionalidades (Features)

### 3.1 Conta & Perfil do usuário
**Descrição:** Cadastro, login e perfil com os dados que alimentam os cálculos.

**Dados do perfil:**
- Nome, e-mail, senha
- Peso (kg) — *obrigatório para o cálculo de água*
- Altura (cm) — opcional
- Idade — opcional
- Sexo — opcional
- Nível de atividade física (sedentário / leve / moderado / intenso)
- Clima/ambiente (opcional — quente aumenta a meta)
- Unidade de medida preferida (litros/ml ou oz)

**Requisitos:**
- RF-1.1: Usuário cria conta com e-mail e senha.
- RF-1.2: Login/logout e recuperação de senha.
- RF-1.3: Editar dados do perfil a qualquer momento.
- RF-1.4: Ao alterar o peso, a meta de água é recalculada automaticamente.

---

### 3.2 Cálculo da meta diária de água
**Descrição:** Calcular quantos litros de água o usuário deve beber por dia, com base no peso (e, opcionalmente, atividade física e clima).

**Fórmula base (padrão) — coeficiente por faixa etária:**
```
Meta base (ml) = peso_kg × coeficiente_por_idade
Meta final (ml) = Meta base + ajuste_atividade + ajuste_clima
```

O coeficiente (ml por kg de peso) **varia com a idade**:

| Faixa etária | Coeficiente | Observação |
|---|---|---|
| Até 17 anos (jovens) | **40 ml/kg** | — |
| 18 a 55 anos (adultos) | **35 ml/kg** | faixa padrão |
| 56 a 65 anos | **30 ml/kg** | — |
| 66 anos ou mais (idosos) | **25 a 30 ml/kg** | usar **30 ml/kg** como padrão; configurável |

> **Exemplo prático:** adulto de 30 anos, 70 kg → 70 × 35 = **2.450 ml ≈ 2,45 L/dia** (sem ajustes).

> **Observação de implementação:** se a idade não for informada, usar o coeficiente padrão de **35 ml/kg** (faixa adulta) e sugerir ao usuário preencher a idade para refinar a meta.

> ⚠️ **Validação obrigatória:** os coeficientes por idade, os ajustes abaixo e quaisquer limites devem ser **revisados e aprovados por um profissional de saúde** antes de irem ao app como orientação. Os valores são um **ponto de partida configurável**, não uma recomendação clínica definitiva.

**Regra de lançamento e apresentação:** até essa aprovação estar registrada, o resultado deve ser chamado de **“estimativa de hidratação”**, acompanhado do disclaimer da §11 e da opção de ajuste manual. A estimativa não deve ser apresentada como prescrição ou recomendação médica. A aprovação clínica documentada é critério obrigatório para habilitar o cálculo automático em produção; sem ela, o lançamento deve permitir registro de água e meta definida pelo usuário, sem sugerir um valor calculado. Registrar responsável revisor, data, versão dos parâmetros aprovados e escopo da revisão.

**Ajuste por nível de atividade física** (acréscimo fixo sobre a meta base):

| Nível | Descrição | Ajuste |
|---|---|---|
| Sedentário | Pouco ou nenhum exercício | +0 ml |
| Leve | Exercício leve 1–3×/semana | +250 ml |
| Moderado | Exercício 3–5×/semana | +500 ml |
| Intenso | Exercício diário / treino pesado | +750 ml |

**Ajuste por clima** (acréscimo fixo sobre a meta base):

| Clima | Ajuste |
|---|---|
| Ameno / padrão | +0 ml |
| Quente | +300 ml |
| Muito quente / calor extremo | +500 ml |

> O clima pode ser informado manualmente pelo usuário (v1) ou, no futuro, obtido por geolocalização/API de clima (v2+).

**Alteração manual da meta:**
- O usuário pode **sobrescrever** a meta calculada com um valor próprio.
- Quando há meta manual, o campo `metodo = manual` e o app **não recalcula automaticamente** ao mudar peso/atividade — mas exibe um aviso: *"Sua meta está no modo manual. Deseja voltar ao cálculo automático?"*.
- O usuário pode, a qualquer momento, **voltar para o modo automático** (`metodo = auto`).

**Comportamento ao mudar o peso:**
- Se `metodo = auto`: a meta é **recalculada automaticamente** e passa a valer a partir daquele momento (o histórico de metas anteriores é preservado — ver §5).
- Se `metodo = manual`: a meta **não muda**, mas o app sugere revisar.

**Requisitos:**
- RF-2.1: Calcular a meta automaticamente a partir do peso + coeficiente por idade + ajustes de atividade e clima.
- RF-2.2: Exibir a meta em litros e em copos (ex.: "2,45 L ≈ 10 copos de 250 ml").
- RF-2.3: Selecionar o coeficiente pela faixa etária (tabela acima) e aplicar os ajustes de atividade e clima.
- RF-2.4: Permitir ao usuário sobrescrever a meta manualmente e voltar ao automático.
- RF-2.5: Recalcular quando peso/idade/atividade/clima mudarem **somente se** a meta estiver em modo automático.
- RF-2.6: Preservar o histórico de metas (cada meta tem `valido_desde`).

**Regras de negócio e limites:**
- Coeficiente padrão e ajustes são **parâmetros configuráveis no backend**, não constantes fixas no código.
- **Limites (1,5 L / 4 L) são provisórios e NÃO são regras universais de segurança.** Servem apenas como faixa de sanidade da interface (evitar valores claramente incorretos). Devem ser validados com um profissional de saúde e podem variar por pessoa.
- Metas fora da faixa provisória não são bloqueadas: o app apenas **exibe um aviso** sugerindo revisão/consulta profissional.

---

### 3.3 Registro de ingestão de água
**Descrição:** O usuário registra cada vez que bebe água e acompanha o progresso em relação à meta do dia.

**Requisitos:**
- RF-3.1: Botões rápidos de registro (+200 ml, +300 ml, +500 ml, copo, garrafa personalizada).
- RF-3.2: Barra/círculo de progresso mostrando "X de Y litros" e % da meta.
- RF-3.3: Histórico do dia (horário de cada registro) com opção de editar/remover.
- RF-3.4: Reset automático da contagem à meia-noite (fuso do usuário).
- RF-3.5: Histórico por dia/semana/mês com gráfico de consumo.
- RF-3.6: Marcar quando a meta diária foi atingida (feedback positivo).

---

### 3.4 Lembretes de beber água
**Descrição:** Notificações que lembram o usuário de beber água ao longo do dia.

**Requisitos:**
- RF-4.1: Lembretes via notificação do navegador (Web Push).
- RF-4.2: Configurar intervalo (ex.: a cada 1h, 1h30, 2h).
- RF-4.3: Definir janela de horário ativo (ex.: das 08h às 22h) — não incomodar à noite.
- RF-4.4: Pausar lembretes quando a meta do dia já foi atingida.
- RF-4.5: Snooze ("lembrar em 15 min") e ligar/desligar lembretes.
- RF-4.6: **Selecionar os dias da semana** em que os lembretes ficam ativos (ex.: só dias úteis). Padrão: todos os dias.
- RF-4.7: **Exibir o próximo lembrete no Dashboard** (ex.: "Próximo lembrete às 14h30").
- RF-4.8: (Opcional v2) Lembrete por e-mail como fallback.

**Regras de comportamento:**
- **Sem permissão de notificação:** se o usuário negar ou não conceder permissão, o app **não quebra** — mostra um aviso explicando que os lembretes dependem da permissão, mantém o "próximo lembrete" visível no Dashboard como lembrete passivo (in-app) e oferece um botão para reativar a permissão.
- **App fechado:** quando Web Push estiver suportado, configurado e autorizado, o serviço de push agenda/envia lembretes ao Service Worker mesmo com a aba fechada. Se esses pré-requisitos não forem atendidos, há somente lembrete passivo enquanto o app estiver aberto; o Dashboard não promete entrega em segundo plano.
- **Evitar duplicatas:** cada lembrete tem uma janela/identificador por horário agendado; se o dispositivo receber o mesmo push mais de uma vez, o Service Worker **deduplica por tag/ID** e não mostra duas notificações iguais. Lembretes já "cumpridos" (usuário registrou água) não disparam o próximo imediato.
- **Pausa inteligente:** ao atingir a meta do dia (RF-4.4), os lembretes restantes do dia são suprimidos automaticamente.
- **Fuso e mudanças de configuração:** a janela e os dias usam o fuso salvo no perfil. Mudança de fuso passa a valer no próximo agendamento; horários já enviados não são reenviados. Alterar intervalo, janela, dias ou desligar lembretes invalida agendamentos futuros antigos. Snooze cria um único lembrete com ID próprio e é cancelado se o usuário registrar água ou atingir a meta.

**Matriz de suporte e fallback:**

| Plataforma / estado | Push em segundo plano | Comportamento do produto |
|---|---|---|
| iOS Safari sem PWA instalado | Não disponível para este produto | Mostrar instrução para adicionar à tela inicial; manter previsão passiva somente com app aberto. |
| iOS com PWA instalado, permissão concedida | Suportado em versões compatíveis do sistema | Push via servidor; informar que depende de instalação, permissão, conexão e suporte do sistema. |
| Android/desktop em navegador compatível, permissão concedida | Suportado em navegadores compatíveis | Push via servidor; se indisponível, oferecer lembrete passivo no app aberto. |
| Qualquer plataforma sem permissão, suporte ou conexão | Não garantido | Mostrar estado e próximo horário como previsão in-app; permitir abrir configurações/instruções quando possível. |

O app deve detectar suporte e permissão em tempo de execução e exibir o estado correto. Push depende de serviço de envio no servidor, inscrição do dispositivo e HTTPS; o Service Worker exibe a notificação, mas não agenda sozinho notificações remotas confiáveis quando o app está fechado.

**Observação técnica / experiência iOS:**
- Web Push exige **Service Worker + permissão do usuário** e **HTTPS**.
- No **iOS/Safari, Web Push só funciona após instalar o PWA na tela inicial.** Por isso o onboarding deve ter um passo guiado de **"Adicionar à tela inicial"** no iPhone (instruções visuais: botão Compartilhar → Adicionar à Tela de Início), exibido apenas para usuários iOS que ainda não instalaram.

---

### 3.5 Regimes (planos alimentares)
**Descrição:** Criar, seguir e acompanhar um regime — um plano com refeições e metas por período.

**Estrutura de um regime:**
- Nome do regime (ex.: "Cutting Nov/26", "Low carb")
- Objetivo (perder peso / manter / ganhar massa / só hidratação)
- Data de início e duração (ex.: 30 dias)
- Metas: meta de água, meta de calorias (opcional), refeições planejadas
- Lista de refeições sugeridas por horário (café, almoço, lanche, jantar)

**Requisitos:**
- RF-5.1: Criar um regime do zero com nome, objetivo e duração.
- RF-5.2: Definir refeições planejadas por horário dentro do regime.
- RF-5.3: Ativar um regime (fica como o plano atual do usuário).
- RF-5.4: Acompanhar aderência: quanto do planejado foi cumprido no dia e na semana.
- RF-5.5: Editar, pausar ou encerrar um regime.
- RF-5.6: Histórico de regimes anteriores.
- RF-5.7: Modelos prontos de regime para o usuário clonar (aba "Explorar"). **Antecipado para a v1 por decisão de produto (nov/2026).** Os modelos são rotinas de organização (horários + tipos de refeição, sem calorias ou porções), baseados no Guia Alimentar para a População Brasileira, e devem passar pela mesma revisão profissional da §10.1 antes do lançamento.

**Regras de ativação e encerramento:**
- Só pode haver **um regime ativo por vez**. Ativar um novo regime pausa automaticamente o anterior.
- Um regime encerra quando: (a) o usuário encerra manualmente, ou (b) a data de fim (`data_inicio + duracao_dias`) é atingida → status vira `encerrado`.
- Regime `pausado` não conta para a aderência enquanto estiver pausado.

**Edição e associação de refeições (v1):**
- Cada `PlannedMeal` ativa pode ter no máximo uma conclusão por usuário e data local. Marcar como concluída manualmente ou associar um ou mais `IntakeLog` a ela conclui a refeição uma única vez; itens adicionais não aumentam a aderência acima de 100%.
- Itens sem `planned_meal_id` permanecem no diário e não afetam a aderência. Um item associado deve pertencer ao usuário e a um regime do usuário; a API rejeita vínculos inválidos.
- Editar ou remover um item do diário recalcula a conclusão derivada: a refeição continua concluída se houver marcação manual ou outro item associado; caso contrário, volta a não concluída. A ação manual de marcar/desmarcar é preservada em campo próprio.
- Alterações no modelo de refeições valem a partir da data local da alteração e não reescrevem aderência de dias anteriores. Refeições removidas ou desativadas deixam de compor o denominador a partir dessa data; conclusões históricas permanecem consultáveis.
- Regime pausado não gera refeições planejadas nem denominador nos dias pausados. Ao retomar, o plano volta a contar a partir da data local da retomada.

**Cálculo de aderência (v1 — regra simples):**
A aderência mede **refeições planejadas cumpridas** sobre **refeições planejadas do período**.

```
Aderência do dia (%) = (refeições planejadas concluídas no dia ÷ total de refeições planejadas do dia) × 100
```

Definições (para v1, mantendo simples):
- **Refeição concluída:** o usuário marcou a refeição planejada como concluída **ou** registrou pelo menos um item do diário associado àquela refeição planejada (`planned_meal_id`). → vale 100% daquela refeição.
- **Refeição parcial:** na v1 **não há percentual parcial** — a refeição é concluída (1) ou não (0). (Cumprimento parcial fica para v2.)
- **Refeição pulada:** se não for marcada/registrada até o fim do dia, conta como **não concluída (0)**.
- **Meta de água:** na v1 a aderência do regime é **só de refeições**. A hidratação é acompanhada separadamente (§3.3) e aparece no Dashboard, mas **não entra** na % de aderência do regime. (Combinar água + refeições numa "aderência geral" fica para v2.)

```
Aderência semanal (%) = (soma das refeições concluídas nos 7 dias ÷ soma das refeições planejadas nos 7 dias) × 100
```
- Dias sem refeições planejadas (ex.: regime pausado) são **excluídos** do denominador.

---

### 3.6 Registro de ingestão / diário alimentar
**Descrição:** Registrar tudo o que foi ingerido no dia — refeições, alimentos e bebidas — além da água. **Na v1 o registro é 100% manual — sem IA nem reconhecimento de alimentos por foto.** O registro manual já é suficiente para lançar qualquer item.

**Campos de um item do diário:**

| Campo | Obrigatório | Exemplo |
|---|---|---|
| Alimento | Sim | Arroz integral |
| Quantidade | Sim | 100 |
| Unidade | Sim | Gramas (g / ml / unidade / porção / fatia / colher) |
| Refeição | Sim | Almoço (café / almoço / lanche / jantar / outro) |
| Horário | Sim | 12:00 |
| Observação | Não | Sem óleo |
| Calorias | Não (opcional) | 130 kcal |

**Bebidas e hidratação (decisão da v1):**
- Bebidas (suco, café, chá, refrigerante) **podem ser registradas no diário alimentar** como qualquer outro item (com unidade em ml).
- **Somente água pura conta para a meta de hidratação** (§3.2/§3.3). Café, suco e outras bebidas **não** somam automaticamente na meta de água na v1 — ficam só no diário alimentar.
- (v2) Avaliar um fator de hidratação por bebida (ex.: chá conta parcialmente), com validação profissional.

**Requisitos:**
- RF-6.1: Adicionar um item com os campos estruturados acima (alimento, quantidade, unidade, refeição, horário, observação).
- RF-6.2: Associar o item a uma **refeição planejada** do regime ativo (`planned_meal_id`) — isso alimenta o cálculo de aderência (§3.5).
- RF-6.3: (Opcional) Registrar calorias manualmente por item.
- RF-6.4: Ver o diário do dia com todos os itens em ordem cronológica, agrupados por refeição.
- RF-6.5: Editar/remover itens registrados.
- RF-6.6: Comparar o ingerido vs. o planejado no regime ativo.
- RF-6.7: Registrar bebidas com unidade em ml.
- RF-6.8: (v2) Base de alimentos com busca para autocompletar calorias/macros.

---

### 3.7 Dashboard / Painel
**Descrição:** Tela inicial que resume o dia do usuário.

**Elementos:**
- Progresso de água do dia (círculo + "X / Y L").
- Próximo lembrete.
- Resumo do diário alimentar do dia.
- Aderência ao regime ativo.
- Gráfico de histórico (semana).
- Mensagem de incentivo / streak (dias seguidos batendo a meta).

---

## 4. Requisitos não-funcionais

- **RNF-1 (Usabilidade):** Registrar água em ≤ 2 cliques. Mobile-first.
- **RNF-2 (Performance):** Carregamento inicial < 2,5s; registro instantâneo (otimista).
- **RNF-3 (Responsivido):** Funciona bem em telas de 320px até desktop.
- **RNF-4 (Offline leve / PWA):** Registrar água mesmo offline, sincronizando depois.
- **RNF-5 (Segurança):** ver requisitos testáveis em §4.1.
- **RNF-6 (Privacidade/LGPD):** ver requisitos testáveis em §4.1.
- **RNF-7 (Acessibilidade):** Contraste adequado, navegação por teclado, labels.
- **RNF-8 (Fuso horário):** Toda contagem/reset respeita o fuso do usuário.

### 4.1 Segurança & Privacidade (LGPD) — requisitos testáveis

Como o app armazena **dados sensíveis de saúde e alimentação**, estes requisitos são obrigatórios e cada um é **verificável por teste**:

- **SEC-1 (Isolamento por usuário):** todo dado (metas, registros, regimes, diário) pertence a um `user_id`; um usuário **nunca** acessa dado de outro. *Teste:* autenticar como usuário A e tentar ler registro de B → deve retornar vazio/403.
- **SEC-2 (Autorização no banco):** regras de acesso aplicadas **no servidor/banco** (ex.: Row Level Security do Postgres/Supabase), não apenas no frontend. *Teste:* requisição direta à API com token de A pedindo dados de B → negada.
- **SEC-3 (Senhas):** armazenadas com **hash forte** (bcrypt/argon2), nunca em texto puro. *Teste:* inspeção da tabela não revela senha legível.
- **SEC-4 (Transporte):** todo tráfego em **HTTPS**; sem conteúdo misto. *Teste:* acesso via HTTP redireciona para HTTPS.
- **SEC-5 (Consentimento):** no cadastro, o usuário **aceita explicitamente** o tratamento de dados (checkbox com link para a política). *Teste:* não é possível concluir o cadastro sem aceitar; a data/versão do consentimento fica registrada.
- **SEC-6 (Exclusão definitiva):** o usuário pode solicitar a exclusão da conta dentro do app. O produto deve concluir o apagamento ou anonimização irreversível dos dados pessoais e de saúde em até **30 dias corridos** após a confirmação da solicitação; a contagem começa na confirmação, e o usuário recebe confirmação quando terminar. Backups devem expirar no ciclo documentado de retenção e não podem ser restaurados para uso normal após a exclusão. Antes do lançamento, a política e os prazos devem ser revisados pelo responsável jurídico/privacidade, inclusive exceções legais de retenção. *Teste:* após o prazo, nenhum dado pessoal do usuário permanece consultável nos sistemas ativos; verificar também o processo e prazo de expiração de backups.
- **SEC-7 (Exportação / portabilidade):** o usuário pode **exportar seus dados pessoais** (perfil, registros de água, diário, regimes) em formato aberto (JSON/CSV). *Teste:* a exportação contém todos os registros do usuário e nada de terceiros.
- **SEC-8 (Política de privacidade):** documento público e acessível descrevendo o que é coletado, por quê, por quanto tempo e os direitos do titular (LGPD). Link no app.
- **SEC-9 (Registro de eventos de segurança / auditoria):** eventos importantes são logados (login, troca/recuperação de senha, solicitação e conclusão de exclusão, exportação de dados, alteração de consentimento) com data/hora, identificador e resultado. Logs não devem conter senha, token ou conteúdo do diário. **Retenção-alvo: 12 meses**, com acesso restrito e exclusão/anonimização ao fim do prazo, sujeita à revisão de privacidade antes do lançamento. *Teste:* realizar cada evento e verificar o registro correspondente, permissões e expiração.
- **SEC-11 (Recuperação de conta):** recuperação por e-mail usa token de uso único, expiração curta e resposta que não revela se o endereço está cadastrado; após redefinição, sessões existentes podem ser revogadas. *Teste:* token expirado/reutilizado é recusado e a resposta não permite enumeração de contas.
- **SEC-12 (Retenção):** publicar uma tabela interna de retenção para dados de conta, logs de auditoria, backups e dados anonimizados; remover dados quando deixarem de ser necessários, respeitando obrigações legais validadas por responsável jurídico/privacidade. A tabela e os prazos finais são critério de lançamento.
- **SEC-10 (Minimização):** coletar apenas o necessário; campos opcionais (altura, idade, sexo) deixados em branco não bloqueiam o uso.

---

## 5. Modelo de dados (alto nível)

> Ajustado conforme revisão: autenticação separada do perfil, histórico de metas, registro estruturado de quantidade/unidade/origem, dias da semana nos lembretes, refeições marcáveis como concluídas e vínculo direto do diário com a refeição planejada (`planned_meal_id`).

**Auth** *(credenciais — idealmente gerenciado pelo provedor de auth, ex.: Supabase Auth)*
`id, email, senha_hash, email_verificado, criado_em, ultimo_login_em`

**Profile** *(perfil do usuário, 1:1 com Auth)*
`id, auth_id (FK), nome, peso_kg, altura_cm, idade, sexo, nivel_atividade, clima, unidade_preferida, fuso, consentimento_aceito_em, consentimento_versao, criado_em, atualizado_em`

**WaterGoal** *(histórico de metas — nunca sobrescreve; cria nova linha)*
`id, user_id (FK), meta_ml, metodo (auto|manual), coeficiente_idade, ajuste_atividade_ml, ajuste_clima_ml, valido_desde, valido_ate (null = vigente)`

**WaterLog** *(cada registro de consumo)*
`id, user_id (FK), quantidade_ml, origem (botao_rapido|manual|outro), registrado_em (timestamp com fuso), data_local (para agrupar por dia no fuso do usuário)`

**ReminderSetting**
`id, user_id (FK), ativo, intervalo_min, hora_inicio, hora_fim, dias_semana (ex.: [seg,ter,qua,qui,sex]), pausar_apos_meta, snooze_min`

**Regime (Plano)**
`id, user_id (FK), nome, objetivo, data_inicio, duracao_dias, data_fim (calculada), meta_agua_ml, meta_calorias (opcional), status (ativo|pausado|encerrado), ativado_em, encerrado_em`

**PlannedMeal (Refeição planejada)**
`id, regime_id (FK), tipo (cafe|almoco|lanche|jantar|outro), horario, descricao, ordem, valido_desde, valido_ate`

**MealCompletion (conclusão de refeição planejada, por dia)**
`id, planned_meal_id (FK), user_id (FK), data_local, marcada_manual (bool), concluida_em`
> A conclusão efetiva é verdadeira se `marcada_manual` ou se houver ao menos um item associado no `IntakeLog` para aquela refeição e dia. Deve haver unicidade em `(planned_meal_id, user_id, data_local)`, para contar a refeição no máximo uma vez.

**IntakeLog (Diário alimentar)**
`id, user_id (FK), planned_meal_id (FK, opcional), tipo_refeicao (cafe|almoco|lanche|jantar|outro), alimento, quantidade (número), unidade (g|ml|unidade|porcao|fatia|colher), observacao, calorias (opcional), eh_bebida (bool), registrado_em, data_local`
> O campo **`planned_meal_id`** liga o item registrado diretamente à refeição planejada que está sendo cumprida — isso simplifica o cálculo de aderência (§3.5).

**SecurityEvent (auditoria — SEC-9)**
`id, user_id (FK, pode ser nulo após exclusão/anonimização), tipo (login|troca_senha|recuperacao_senha|solicitacao_exclusao|conclusao_exclusao|exportacao_dados|alteracao_consentimento), resultado, detalhe_minimo, criado_em, expira_em`

---

## 6. Fluxos principais (User flows)

**Fluxo A — Onboarding**
Cadastro e consentimento → informa dados disponíveis → se a fórmula estiver aprovada, app apresenta a estimativa de água; caso contrário, usuário define sua própria meta → configura lembretes conforme suporte/permissão da plataforma → dashboard.

**Fluxo B — Beber água**
Dashboard → toca "+300 ml" → barra de progresso atualiza → ao bater a meta, recebe feedback e lembretes pausam.

**Fluxo C — Criar regime**
Menu Regimes → "Novo regime" → nome, objetivo, duração → adiciona refeições planejadas → ativa.

**Fluxo D — Registrar refeição**
Dashboard → "Adicionar o que comi" → escolhe refeição/horário, descreve item → salva → aparece no diário e compara com o planejado.

---

## 7. Métricas de sucesso (KPIs)

- **Atingimento de meta semanal:** usuários ativos com meta válida em pelo menos 4 dias locais da semana que registraram consumo igual ou superior à meta vigente naquele dia ÷ usuários ativos com pelo menos 4 dias elegíveis naquela semana. Meta alterada vale a partir do seu `valido_desde`; dias sem registro contam como não atingidos. Semanas são calculadas no fuso do perfil.
- Para estas métricas, **usuário ativo** significa conta não excluída que realizou ao menos uma ação principal (registro de água, item alimentar ou conclusão de refeição) na semana. **Dia elegível** significa dia local posterior ao cadastro, com conta ativa e meta válida; dia sem registro continua elegível e conta como não atingido.
- **Retenção D7/D30:** percentual da coorte de novos usuários que registra ao menos uma ação principal na janela dos dias 6–8 / 29–31 após a primeira ação. Só entram no denominador usuários cuja janela inteira já terminou. Mostrar tamanho da coorte e retenção exata e acumulada separadamente.
- **Registros de água por usuário/dia:** total de registros de água ÷ dias de usuário com ao menos uma sessão; exibir mediana e média para reduzir distorção por usuários intensivos.
- **Regimes ativos:** usuários com regime em status `ativo` no fim da semana ÷ usuários ativos na semana. Regimes pausados não contam.
- **Refeições registradas por usuário/semana:** número de refeições planejadas distintas concluídas ou refeições não planejadas registradas, por usuário ativo e semana local; múltiplos itens da mesma refeição planejada contam como uma refeição.
- **Opt-in de push:** usuários elegíveis que concederam permissão de notificação ÷ usuários elegíveis que viram o pedido de permissão. Reportar separadamente “não solicitado”, “não suportado”, “concedido” e “negado/recusado”; não classificar quem não viu o pedido como recusa.

Os indicadores devem ser calculados com eventos mínimos e pseudonimizados. Não incluir alimento, observação ou outros conteúdos do diário nos eventos analíticos.

---

## 8. Roadmap sugerido

**v1 — MVP (este documento)**
Conta/perfil, cálculo de água (por idade/peso + ajustes), registro de água, lembretes push, regimes com aderência simples, diário alimentar manual estruturado, dashboard, relatórios básicos, segurança/privacidade (§4.1). **Sem IA e sem base de alimentos.**

**v2**
- Base completa de alimentos (busca/autocomplete).
- Cálculo automático de calorias (a partir da base de alimentos).
- Modelos prontos de regime.
- Conquistas / gamificação avançada (streaks, badges).
- Lembretes por e-mail (fallback).
- Aderência com cumprimento parcial e "aderência geral" (água + refeições).
- Gráficos avançados.

**v3**
- Inteligência artificial alimentar (sugestões de ajuste de meta/plano).
- Reconhecimento de alimentos por foto.
- Integração Apple Health / wearables.
- Acompanhamento por profissional (nutricionista).

**Por que faseado:** manter o MVP enxuto e entregável. IA, base de alimentos e integrações são custosas e não são necessárias para provar o valor central (hidratação + diário + regime).

---

## 9. Riscos & dependências

| Risco | Mitigação |
|---|---|
| Web Push limitado no iOS/Safari | Oferecer PWA "adicionar à tela inicial" + fallback por e-mail (v2) |
| Usuário informar peso errado → meta errada | Validação de faixa + aviso de meta fora do normal |
| Baixa adesão aos lembretes | Intervalos configuráveis + não incomodar à noite + snooze |
| Dado de saúde sensível (LGPD) | Consentimento, exportação e exclusão de dados (§4.1) |
| Coeficientes/limites de água sem respaldo clínico | **Validar fórmula, ajustes e limites com um profissional de saúde** antes do lançamento; tratar valores como configuráveis |
| Lembretes não chegam (iOS / permissão negada) | Passo de instalação PWA no onboarding + lembrete passivo no Dashboard + fallback e-mail (v2) |

---

## 10. Perguntas em aberto

**Resolvidas:**
- ~~Fórmula de água~~ → **Resolvido:** coeficiente por faixa etária (40/35/30/25–30 ml/kg) + ajustes de atividade e clima (§3.2).
- ~~Calorias/macros na v1?~~ → **Resolvido:** calorias são **opcionais e manuais** na v1; base de alimentos e cálculo automático ficam para a v2.
- ~~IA/reconhecimento de alimentos na v1?~~ → **Resolvido:** **não** na v1; registro 100% manual.

**Ainda em aberto:**
- Validação clínica: quem é o profissional de saúde que vai **aprovar os coeficientes e limites** antes do lançamento?
- Haverá planos pagos/freemium? (impacta auth e limites)
- Idioma: só português ou multi-idioma desde o início?
- Revisão de privacidade/jurídica: quem aprova a tabela final de retenção, o prazo-alvo de exclusão de 30 dias e o prazo-alvo de 12 meses para logs (SEC-6, SEC-9, SEC-12)?

### 10.1 Critérios de decisão antes do lançamento

- A fórmula automática só é habilitada em produção após aprovação clínica documentada (§3.2). Sem aprovação, a meta é informada pelo próprio usuário.
- A exclusão em até 30 dias e a retenção de logs por até 12 meses são metas de produto propostas; a política pública e eventuais exceções só são finalizadas após revisão jurídica/privacidade.
- Lembretes têm matriz de suporte e fallback definidos na §3.4; a interface nunca promete entrega quando plataforma, instalação ou permissão não atendem aos pré-requisitos.

---

## 11. Disclaimer (importante)

Este aplicativo tem caráter informativo e de apoio ao hábito de hidratação e organização alimentar. **Não substitui orientação médica ou nutricional profissional.** As metas de água e os regimes são estimativas gerais; pessoas com condições de saúde específicas (ex.: problemas renais, cardíacos, gravidez) devem consultar um profissional antes de seguir qualquer meta.

---

## 12. Identidade visual & Design System

> Baseado nos mockups aprovados em `/imagens`. O web app deve reproduzir fielmente este visual **premium, estilo iOS, mobile-first**.

### 12.1 Princípios de design
- **Mobile-first / PWA:** desenhado primeiro para a tela do celular; "adicionar à tela inicial" com cara de app nativo.
- **Premium e calmo:** muito espaço em branco, cantos arredondados, sombras suaves, sensação de leveza.
- **Natureza + água:** fotografia de folhas e gotas no card de hidratação reforça a marca.
- **Foco na ação:** registrar água e refeição é sempre o elemento mais destacado da tela.

### 12.2 Paleta de cores
| Uso | Cor (aprox.) | Hex sugerido |
|---|---|---|
| Verde primário (marca, textos de destaque, botões) | Verde-floresta escuro | `#1B4B3A` |
| Verde profundo (fundo do card de hidratação) | Verde escuro | `#143D2B` |
| Verde-menta / esmeralda (anel de progresso, acentos) | Verde vibrante | `#34D399` / `#2ECC8F` |
| Verde claro (ícones, chips, fundos de ícone) | Verde suave | `#A7D8C4` |
| Fundo da tela | Off-white esverdeado | `#F2F6F2` |
| Cards | Branco | `#FFFFFF` |
| Texto principal | Verde quase-preto | `#13261E` |
| Texto secundário | Cinza esverdeado | `#6B7D74` |
| Alerta / "sair" | Vermelho suave | `#E5484D` |

### 12.3 Tipografia
- Família sans-serif moderna (ex.: **Inter**, **SF Pro** ou **Satoshi**).
- Títulos em **bold/extrabold** e grandes (ex.: "Bom dia, Ana." / "1,68 L").
- Hierarquia clara: número grande + rótulo pequeno em maiúsculas (ex.: `HIDRATAÇÃO`).

### 12.4 Componentes-chave
- **Card de hidratação:** fundo verde escuro com imagem de folha, anel de progresso circular com % no centro, litros à direita e botão "Registrar consumo de água".
- **Anel de progresso circular:** traço de gradiente verde-menta, usado para hidratação.
- **Cards de métrica:** brancos, com ícone verde, número grande (ex.: "Alimentação 3 de 4", "Consistência 7 dias").
- **Lista de rotina / refeições:** ícone em quadradinho verde-claro + nome + check circular verde quando concluído.
- **Modal "Registrar água":** stepper com – / + , valor grande em ml, atalhos (200 ml, 300 ml, 500 ml, 1 L) e botão "Registrar".
- **Chips de período:** Hoje / Semana / Mês (pill verde para o ativo).
- **Gráfico de barras** (Relatórios): barras verdes com média e variação (+12% vs. semana anterior).

### 12.5 Navegação — Tab bar (5 abas)
Barra fixa na base, presente nas telas principais:

| Aba | Ícone | Destino |
|---|---|---|
| **Início** | casa | Dashboard |
| **Água** | gota | Hidratação + histórico |
| **Diário** | garfo/faca | Diário alimentar |
| **Planos** | calendário | Regimes |
| **Perfil** | pessoa | Perfil & configurações |

### 12.6 Requisitos de experiência por módulo
Como a estética é **Premium iOS**, cada módulo tem exigências de interação:

- **Hidratação:** registro em **1 ou 2 toques** (atalhos de ml + stepper), histórico do dia visível, e **animação de celebração ao atingir a meta** (ex.: anel completa + micro-animação/haptics).
- **Alimentação:** adicionar refeições rapidamente, **visualizar os itens** de cada refeição e **editar/remover** registros sem fricção.
- **Evolução (Relatórios):** gráficos semanais, metas atingidas, consistência (streak) e histórico mensal.

### 12.7 Estados da interface (não desenhar só o "tudo certo")
Todas as telas principais devem prever e desenhar explicitamente:

| Estado | Comportamento |
|---|---|
| **Carregando** | Skeletons/placeholders no lugar dos cards; nunca tela branca travada. |
| **Vazio (sem registros)** | Mensagem amigável + ação (ex.: "Você ainda não registrou água hoje. Toque em + para começar."). |
| **Erro** | Mensagem clara + botão "Tentar novamente"; não expor erro técnico cru. |
| **Offline / sem conexão** | Permitir registrar água e refeição offline (fila local) e **sincronizar depois**; indicar status "salvo offline". |
| **Sem permissão de notificação** | Aviso explicativo + botão para reativar (ver RF-4 regras). |
| **Meta/aderência zerada** | Estado inicial do dia bem tratado, sem parecer "quebrado". |

### 12.8 Prioridade dos requisitos e telas

O escopo funcional do MVP permanece o definido na §8. Esta classificação esclarece o que é obrigatório dentro dele; “futuro” remete ao roadmap. Requisitos não marcados como opcionais/futuros nas seções 3 e 4 são **v1 essenciais**.

| Prioridade | Itens |
|---|---|
| **v1 essencial** | Conta e perfil; cálculo configurável sujeito à aprovação clínica; registro e histórico de água; lembretes com comportamento compatível com a plataforma; regimes e aderência básica; diário manual; dashboard; segurança e privacidade; estados de erro, vazio, carregando e offline conforme requisitos. |
| **v1 opcional / acabamento** | Explorar com modelos prontos de regime (antecipado, ver RF-5.7); streak e animação/haptics de celebração; foto no formulário de refeição (a foto não implica reconhecimento); gráficos avançados além do resumo semanal; refinamentos visuais que não bloqueiem os fluxos principais. |
| **Futuro (v2+)** | Base de alimentos e autocomplete; macros automáticos; IA/reconhecimento por foto; wearables; acompanhamento profissional; lembrete por e-mail; aderência parcial ou combinada com água. |

Uma funcionalidade marcada como essencial só pode ser retirada da v1 por decisão explícita de produto e atualização deste quadro, dos critérios de aceite e das telas relacionadas.

---

## 13. Mapa de telas (do mockup)

As 12 telas aprovadas e a qual requisito cada uma atende:

1. **Splash / Boas-vindas** — logo "Projeto Saúde", slogan, botões *Começar* e *Já tenho uma conta*. → RF-1.1
2. **Onboarding — dados** — Peso, Altura, Idade, Sexo, Nível de atividade → botão *Calcular minha meta*. → RF-1.1, RF-2.1
3. **Início (Dashboard)** — saudação, card de hidratação (68% / 1,68 L de 2,45 L), cards *Alimentação 3 de 4* e *Consistência 7 dias*, metas do dia, "Sua rotina". → RF-3.2, §3.7
4. **Hidratação** — abas Hoje/Semana/Mês, anel 68%, atalhos de consumo, registros do dia (editar/excluir). → RF-3.1, RF-3.3, RF-3.5
5. **Modal Registrar água** — stepper 300 ml, atalhos 200/300/500 ml e 1 L, botão Registrar. → RF-3.1
6. **Diário alimentar** — abas por dia, lista de refeições (Café, Almoço, Lanche, Jantar) com check, botão *Adicionar refeição*. → RF-6.4, §3.6
7. **Adicionar refeição** — foto, tipo de refeição, horário, itens com quantidade, botão Salvar. → RF-6.1, RF-6.2
8. **Planos (Regimes)** — lista de planos do usuário com status e % de aderência, *Criar novo plano*. A aba *Explorar* traz os modelos prontos (RF-5.7). → RF-5.1, RF-5.3, RF-5.4, RF-5.7
9. **Detalhe do plano (Emagrecimento)** — duração, aderência 75%, abas Plano/Refeições/Orientações, refeições do dia. → RF-5.2, RF-5.4
10. **Lembretes** — toggle Ativar, frequência, período (08h–22h), dias da semana, prévia da notificação. → RF-4.1 a RF-4.5
11. **Relatórios** — abas Água/Alimentação/Geral, média diária, gráfico de barras 7 dias, meta atingida e aderência. → RF-3.5, §7
12. **Meu perfil** — avatar, nome/e-mail, Meus dados, Metas e preferências, Lembretes, Unidade de medida, Segurança, Sair. → RF-1.3, §3.1

> **Observação de plataforma (decidido):** o produto é um **PWA mobile-first** — um único web app que roda no navegador em **desktop e celular** e pode ser **instalado na tela inicial** (iOS, Android e desktop), comportando-se como app nativo. Os mockups estão em moldura de iPhone, mas o layout de uma coluna, a tab bar inferior e os cards já funcionam perfeitamente no navegador do celular; no desktop, centralizar o conteúdo em uma coluna estreita (~420px) mantendo a mesma identidade.
>
> **O que torna um PWA (requisitos técnicos):**
> - **Manifest** (`manifest.json`) com nome, ícones, cores e `display: standalone`.
> - **Service Worker** para cache/offline e para receber **Web Push** (lembretes).
> - Servido em **HTTPS**.
> - Ícones e splash em vários tamanhos; suporte a "Adicionar à tela inicial".
> - **Limitação iOS/Safari:** Web Push só funciona após o usuário instalar o PWA na tela inicial — documentar no onboarding.

---

## 14. Ordem de desenvolvimento (execução)

Sequência recomendada para construir o MVP de forma controlada:

| Etapa | Entrega | Inclui |
|---|---|---|
| **1. Fundação** | Base do sistema | Cadastro, login, perfil, banco de dados, segurança/privacidade (§4.1), estrutura PWA (manifest + service worker) |
| **2. Hidratação** | Núcleo do produto | Cálculo de meta (por idade/peso + ajustes), registro de água, histórico, lembretes push |
| **3. Dashboard** | Tela inicial | Resumo diário, indicadores, progresso, próximo lembrete |
| **4. Diário alimentar** | Registro de refeições | Campos estruturados, bebidas, comparação com o planejado |
| **5. Regimes** | Planos | Criar, editar, ativar/encerrar, aderência |
| **6. Relatórios & Config.** | Evolução e ajustes | Gráficos, preferências, privacidade, perfil |
| **7. Testes & Lançamento** | Qualidade | Responsividade, PWA, permissões, segurança, desempenho, estados de UI (§12.7) |

Cada etapa é uma fatia vertical entregável (frontend + backend + teste), permitindo validar valor cedo — especialmente a Etapa 2, que é o coração do app.

---

*Fim do documento — PRD v1.3*
