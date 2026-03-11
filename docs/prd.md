# Potencia Tracking — Product Requirements Document (PRD)

> Plataforma de tracking UTM multi-projeto para produtos digitais da Potencia Educacao / HMNews.

---

## 1. Goals and Background Context

### 1.1 Goals

- **Centralizar o tracking de todos os links UTM** utilizados nos produtos digitais da Potencia Educacao (cursos, lancamentos, conteudos, campanhas) em uma unica plataforma
- **Metrificar resultados por link e por campanha**, permitindo a equipe interna identificar quais canais e acoes geram mais trafego e conversoes
- **Superar as limitacoes do expo-eletrica-tracking** — sem autenticacao, links salvos apenas no browser (localStorage), dependencia total de Google Sheets, limitado a um unico dominio/evento
- **Suportar multiplos projetos/produtos simultaneamente**, nao apenas um evento isolado como o Expo Eletrica
- **Cobrir todos os canais de distribuicao** — link da bio, email marketing, YouTube, automacao (Mautic), grupos de WhatsApp, redes sociais, entre outros

### 1.2 Background Context

A equipe da HMNews/Potencia Educacao opera multiplos produtos digitais — cursos, pos-graduacoes, eventos e lancamentos — e distribui links de divulgacao por diversos canais (Instagram, YouTube, email, WhatsApp, automacoes via Mautic). Hoje, o unico sistema de tracking existente e o **expo-eletrica-tracking**, construido especificamente para a Expo Eletrica 2026, que funciona com Next.js + Google Sheets + Google Apps Script. Embora funcional, ele tem limitacoes criticas: sem autenticacao, links salvos apenas em localStorage (perdem-se ao trocar de maquina), backend limitado a Google Sheets sem banco de dados real, tracking restrito ao dominio euvou.events, e sem suporte a multiplos projetos.

O **potencia-tracking** nasce como a evolucao desse conceito — uma plataforma multi-projeto, persistente, segura e escalavel que dara a equipe interna controle total sobre todos os links UTM e seus resultados em qualquer produto digital.

### 1.3 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-10 | 0.1 | Initial PRD draft | Morgan (PM) |
| 2026-03-10 | 0.2 | Added success metrics, out of scope, data retention | Morgan (PM) |
| 2026-03-10 | 0.3 | Added project_pages table (Story 1.2), Link Generator v2 with page selector (Story 2.1) | Morgan (PM) + Uma (UX) |

### 1.4 Success Metrics

| Metric | Baseline (hoje) | Target (30 dias pos-lancamento) | Target (90 dias) |
|--------|-----------------|--------------------------------|-------------------|
| Links UTM criados via plataforma | 0 (manual/localStorage) | 100% dos novos links | 100% + migracao dos existentes |
| Tempo para criar um link rastreavel | ~5 min (manual) | < 1 min (gerador assistido) | < 30s (com templates) |
| Projetos com tracking ativo | 1 (Expo Eletrica, parcial) | >= 3 projetos | Todos os projetos ativos |
| Visibilidade de performance por canal | Nenhuma centralizada | Dashboard consultado semanalmente | Dashboard consultado diariamente |
| Conversoes rastreadas com atribuicao | ~40% (orphans no expo-eletrica) | >= 70% com tracking_id associado | >= 85% |

### 1.5 Out of Scope (MVP)

Os seguintes itens **NAO** fazem parte do MVP e ficam para versoes futuras:

- **Multi-tenant / multi-organizacao** — MVP atende apenas equipe HMNews/Potencia. Sem login de clientes externos
- **Integracao bidirecional com Mautic** — Tracking captura UTMs de links do Mautic, mas nao envia dados de volta ao Mautic automaticamente
- **Notificacoes e alertas** — Sem emails, Slack ou push notifications sobre performance de campanhas
- **Relatorios PDF/Excel automatizados** — Export CSV manual e suficiente para MVP
- **API publica/webhooks** — Sem API aberta para integracao com sistemas terceiros
- **A/B testing de links** — Sem variantes automaticas ou split testing
- **Heatmaps ou gravacao de sessao** — Fora do escopo, usar Hotjar/Clarity se necessario
- **App mobile nativo** — Web responsive atende, sem necessidade de app iOS/Android
- **Migracao automatica do expo-eletrica** — Migracao de dados sera task manual opcional pos-MVP

---

## 2. Requirements

### 2.1 Functional

- **FR1:** O sistema deve suportar multiplos projetos/produtos, cada um com seus proprios links, campanhas e metricas isoladas (ex: "Pos-Graduacao Instalacoes Eletricas", "Curso NR-10", "Expo Eletrica 2026")
- **FR2:** O sistema deve permitir criar, editar, duplicar e excluir links UTM com gerador visual assistido (source, medium, campaign, content, term), persistidos em banco de dados
- **FR3:** O sistema deve capturar cliques e conversoes via script de tracking injetavel em qualquer dominio/pagina, nao limitado a um dominio especifico
- **FR4:** O dashboard deve exibir metricas em tempo real por projeto: total de cliques, conversoes, taxa de conversao, top sources, e graficos de tendencia temporal
- **FR5:** O sistema deve permitir filtrar dados por periodo (hoje, 7d, 30d, 90d, custom), por projeto, por canal (source), por campanha e por medium
- **FR6:** O sistema deve suportar os canais: Instagram, Facebook, LinkedIn, YouTube, Email Marketing, WhatsApp, Google Ads, Link da Bio, Automacao (Mautic), Site, e permitir canais customizados
- **FR7:** O sistema deve exigir autenticacao para acesso ao dashboard, com login da equipe interna
- **FR8:** O sistema deve permitir exportar dados em CSV (com encoding UTF-8 BOM para compatibilidade com Excel)
- **FR9:** O sistema deve gerar short links ou redirect links rastreaveis para uso em canais com limite de caracteres (bio, WhatsApp, SMS)
- **FR10:** O sistema deve exibir uma tabela de conversoes/inscricoes com busca, ordenacao por coluna e paginacao completa
- **FR11:** O sistema deve registrar cada clique com: tracking_id, timestamp, UTM params, page_url, referrer, user_agent, IP (anonimizado)
- **FR12:** O sistema deve associar conversoes a cliques existentes via tracking_id, e tratar conversoes orfas (sem clique previo)

### 2.2 Non Functional

- **NFR1:** O dashboard deve carregar em menos de 3 segundos na primeira visita e menos de 1 segundo em navegacoes subsequentes
- **NFR2:** O script de tracking deve ter menos de 15KB minificado e nao impactar o LCP da pagina hospedeira em mais de 100ms
- **NFR3:** O sistema deve suportar ate 100.000 cliques/mes e 10.000 conversoes/mes sem degradacao de performance
- **NFR4:** Os dados devem ser persistidos em banco de dados relacional (Supabase/PostgreSQL), nao em Google Sheets ou localStorage
- **NFR5:** O sistema deve ser responsivo (mobile-first) para consulta rapida pelo celular da equipe
- **NFR6:** O sistema deve implementar autenticacao segura com sessoes, CORS restrito e rate limiting na API
- **NFR7:** O deploy deve ser via Vercel com CI/CD automatizado via GitHub
- **NFR8:** Dados de tracking_events devem ser retidos por 365 dias. Apos esse periodo, podem ser arquivados ou agregados para reduzir volume. Links e projetos sao retidos indefinidamente
- **NFR9:** O sistema deve ter disponibilidade de 99.5% (aceita ~3.6h de downtime/mes). O endpoint `/api/track` e o redirect `/r/[slug]` sao criticos — devem responder mesmo durante deploys (Vercel zero-downtime)
- **NFR10:** Backups automaticos do banco via Supabase (daily backups inclusos no plano). Recovery point objective (RPO): 24 horas

---

## 3. User Interface Design Goals

### 3.1 Overall UX Vision

Interface limpa e funcional inspirada em ferramentas de analytics modernas (Plausible, PostHog), com foco em **clareza de dados e acao rapida**. O usuario deve conseguir em menos de 3 cliques: ver performance de um projeto, gerar um link, ou exportar dados. Design dark-mode-first (equipe usa muito a noite), com opcao light.

### 3.2 Key Interaction Paradigms

- **Project Switcher** — Seletor persistente no header para alternar entre projetos rapidamente, sem perder contexto
- **Dashboard-first** — Tela inicial sempre mostra o overview do projeto ativo com KPIs, graficos e atividade recente
- **Inline actions** — Criar link, copiar URL, filtrar dados — tudo sem navegar para outra pagina (modais e popovers)
- **Feedback instantaneo** — Toasts ao copiar link, estados de loading com skeleton, indicadores de dados em tempo real

### 3.3 Core Screens and Views

1. **Login** — Autenticacao simples da equipe interna
2. **Dashboard Overview** — KPIs, graficos de tendencia, top sources, atividade recente (por projeto)
3. **Links Manager** — Tabela com todos os links UTM, busca, filtros, acoes (copiar, editar, duplicar, excluir)
4. **Link Generator** — Formulario assistido para criar links UTM com preview em tempo real
5. **Conversoes/Inscricoes** — Tabela detalhada com busca, sort, filtros e export
6. **Projetos** — Lista/CRUD de projetos com configuracoes de tracking por projeto
7. **Settings** — Configuracao de conta, canais customizados, integracoes

### 3.4 Accessibility: WCAG AA

Conformidade WCAG AA — contraste minimo, navegacao por teclado, labels em formularios, leitores de tela.

### 3.5 Branding

- Seguir identidade visual **Potencia Educacao** — cores institucionais, logo no header
- Tipografia clean e moderna (Inter ou similar)
- Dark mode como padrao, light mode como alternativa

### 3.6 Target Device and Platforms: Web Responsive

Web Responsive — desktop como plataforma principal de trabalho, mobile-friendly para consultas rapidas no celular.

> **Nota de implementacao:** Ao criar a UI, ativar `@ux-design-expert` (Uma) e utilizar as skills disponiveis: `ui-ux-pro-max`, `frontend-design`, `tailwind-v4-shadcn`, `nextjs-16-complete-guide`, `vercel-react-best-practices`, `web-design-guidelines`, entre outras.

---

## 4. Technical Assumptions

### 4.1 Repository Structure: Monorepo

Repositorio unico `potencia-tracking` no GitHub (`hmnews-potencia/potencia-tracking`).

### 4.2 Service Architecture

**Monolith (Next.js Full-Stack)**

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| **Framework** | Next.js 16+ (App Router) | Preset ativo, mesmo do expo-eletrica. React 19 com Server Components |
| **UI** | Tailwind CSS 4 + shadcn/ui | Tailwind ja usado no expo-eletrica. shadcn/ui acelera componentes |
| **State** | Zustand | Preset padrao. Estado do projeto ativo, filtros, UI state |
| **Charts** | Recharts 3 | Ja validado no expo-eletrica-tracking |
| **Database** | Supabase (PostgreSQL) | Ja usado em nova-horeb e design-social-media. Substitui Google Sheets |
| **Auth** | Supabase Auth | Vem gratis com Supabase. Email/senha para equipe interna |
| **Deploy** | Vercel | Padrao de todos os projetos HMNews |
| **Tracking Script** | Vanilla JS (standalone) | Evolucao do utm-tracker-v3.js. Injetavel em qualquer site |
| **Icons** | Lucide React | Ja usado no expo-eletrica |
| **Date** | date-fns 4 | Ja usado no expo-eletrica |

### 4.3 Testing Requirements

| Tipo | Ferramenta | Escopo |
|------|-----------|--------|
| Unit | Vitest | Funcoes de parsing UTM, calculos de metricas, validacoes |
| Integration | Vitest + Testing Library | Componentes React, formulario de links, filtros |
| E2E | Playwright (quando necessario) | Fluxo critico: login → criar link → ver no dashboard |
| Lint | ESLint + Prettier | Qualidade de codigo |
| Types | TypeScript strict | Type safety |

### 4.4 Additional Technical Assumptions

- **Supabase RLS (Row Level Security)** para isolar dados por organizacao/equipe
- **API Routes (Next.js)** como proxy para Supabase — nunca expor chave Supabase no client
- **Script de tracking** deve ser um arquivo JS standalone (nao React), hospedado no Vercel, injetavel via `<script src>`
- **Short links** via redirect routes no Next.js (`/r/[slug]` → redirect 302 com tracking) — sem dependencia de servico externo
- **Migracao de dados** do expo-eletrica-tracking (Google Sheets → Supabase) como task opcional pos-MVP
- **Variaveis de ambiente** via Vercel Environment Variables (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY)

---

## 5. Epic List

- **Epic 1: Foundation & Auth** — Setup do projeto Next.js 16, Supabase (schema + auth), deploy Vercel, e tela de login funcional com projeto-padrao criado
- **Epic 2: Link Management** — CRUD completo de links UTM com gerador visual assistido, short links (`/r/[slug]`), e persistencia em Supabase
- **Epic 3: Tracking Engine** — Script de tracking standalone (vanilla JS) injetavel em qualquer site, API de ingestao de cliques/conversoes, e associacao tracking_id <-> conversao
- **Epic 4: Dashboard & Analytics** — Dashboard com KPIs, graficos de tendencia (Recharts), tabela de conversoes, filtros avancados (periodo, projeto, canal, campanha) e export CSV

---

## 6. Epic Details

### Epic 1: Foundation & Auth

**Goal:** Estabelecer a fundacao tecnica do projeto (Next.js 16 + Supabase + Vercel) com autenticacao funcional e gestao basica de projetos, entregando a primeira tela utilizavel: login → dashboard vazio com project switcher.

---

#### Story 1.1: Project Bootstrap & Deploy Pipeline

> Como **desenvolvedor da equipe**,
> eu quero o projeto Next.js 16 configurado com Tailwind CSS 4, shadcn/ui e deploy automatico na Vercel,
> para que tenhamos a infraestrutura base pronta para desenvolvimento.

**Acceptance Criteria:**

1. Projeto Next.js 16 (App Router) criado com TypeScript strict, Tailwind CSS 4 e shadcn/ui configurados
2. ESLint + Prettier configurados com regras do preset `nextjs-react`
3. Estrutura de pastas definida: `src/app/`, `src/components/`, `src/lib/`, `src/types/`
4. Pagina canary (`/`) exibe "Potencia Tracking" com logo placeholder e versao
5. Deploy funcional na Vercel acessivel via URL (potencia-tracking.vercel.app ou similar)
6. `.env.example` documenta todas as variaveis necessarias
7. Repositorio criado no GitHub (`hmnews-potencia/potencia-tracking`) com CI via Vercel

---

#### Story 1.2: Database Schema & Supabase Setup

> Como **desenvolvedor da equipe**,
> eu quero o schema do banco de dados criado no Supabase com as tabelas core,
> para que o sistema tenha persistencia real desde o inicio.

**Acceptance Criteria:**

1. Projeto Supabase criado e conectado ao Next.js via variaveis de ambiente
2. Tabela `projects` criada: id, name, slug, description, base_url, created_at, updated_at
3. Tabela `utm_links` criada: id, project_id (FK), label, base_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term, short_slug (unique), full_url (generated), created_at, updated_at
4. Tabela `tracking_events` criada: id, project_id (FK), link_id (FK nullable), tracking_id, event_type (click|conversion), timestamp, utm_source, utm_medium, utm_campaign, utm_content, utm_term, page_url, referrer, user_agent, ip_hash
5. Tabela `project_pages` criada: id, project_id (FK projects), name (ex: "Pagina de Vendas NR-10"), url (ex: "https://potencia.edu.br/nr10"), is_default (boolean), created_at — permite registrar multiplas paginas/destinos por projeto
6. Tabela `profiles` criada: id (FK auth.users), email, full_name, role, created_at
7. RLS policies habilitadas em todas as tabelas — apenas usuarios autenticados podem ler/escrever
8. Projeto-padrao seed criado: "Potencia Educacao — Geral"
9. Supabase client configurado em `src/lib/supabase/client.ts` e `server.ts`

---

#### Story 1.3: Authentication & Protected Routes

> Como **membro da equipe interna**,
> eu quero fazer login com email/senha para acessar o dashboard,
> para que apenas pessoas autorizadas vejam os dados de tracking.

**Acceptance Criteria:**

1. Tela de login implementada em `/login` com campos email + senha, usando shadcn/ui (Input, Button, Card)
2. Autenticacao via Supabase Auth (email/password) funcional
3. Middleware Next.js protege todas as rotas exceto `/login` — redireciona nao-autenticados para `/login`
4. Apos login bem-sucedido, redireciona para `/` (dashboard)
5. Botao de logout visivel no header, encerra sessao e redireciona para `/login`
6. Perfil do usuario logado (`profiles`) e criado automaticamente no primeiro login via trigger Supabase
7. Feedback visual para erros de login (credenciais invalidas, rede indisponivel)
8. Sessao persiste entre reloads (cookie-based via Supabase SSR)

---

#### Story 1.4: Project Management & Layout Shell

> Como **membro da equipe interna**,
> eu quero criar e alternar entre projetos no header do dashboard,
> para que eu possa organizar tracking por produto/curso separadamente.

**Acceptance Criteria:**

1. Layout shell implementado: header com logo, project switcher (dropdown), user menu (avatar + logout)
2. Sidebar ou nav com itens: Dashboard, Links, Conversoes (disabled/placeholder por enquanto)
3. Project switcher lista todos os projetos do usuario e permite alternar — projeto ativo salvo em cookie/localStorage
4. Modal de "Novo Projeto" com campos: nome, slug (auto-gerado), descricao, URL base
5. CRUD completo de projetos via API routes (`/api/projects`)
6. Pagina `/` exibe estado vazio ("Nenhum dado ainda — crie seu primeiro link UTM") quando projeto nao tem dados
7. Projeto ativo e propagado via context/Zustand para todos os componentes filhos
8. Responsivo: header colapsa em menu hamburger no mobile

---

### Epic 2: Link Management

**Goal:** Entregar o sistema completo de criacao, gestao e compartilhamento de links UTM com gerador visual assistido e short links, permitindo a equipe substituir imediatamente o localStorage do expo-eletrica por persistencia real.

---

#### Story 2.1: UTM Link Generator

> Como **membro da equipe interna**,
> eu quero criar links UTM atraves de um formulario assistido com preview em tempo real,
> para que eu gere links padronizados sem erros manuais.

**Acceptance Criteria:**

1. Pagina `/links` com botao "Novo Link" que abre formulario de criacao (modal ou inline)
2. Seletor de projeto (dropdown) no topo do formulario — pre-selecionado com o projeto ativo, mas permite trocar
3. Seletor de pagina destino (combobox) populado com paginas cadastradas do projeto selecionado (`project_pages`), com opcao "Adicionar nova pagina" inline (nome + URL). A URL base do link e preenchida automaticamente a partir da pagina selecionada
4. Campos do formulario: Label (nome descritivo), Source, Medium, Campaign, Content (opcional), Term (opcional)
5. Source e Medium oferecem opcoes pre-definidas (Instagram, Facebook, YouTube, WhatsApp, Email, Google Ads, LinkedIn, Bio, Mautic, Site) com opcao de digitar customizado
6. Preview em tempo real da URL final montada conforme o usuario preenche os campos
7. Botao "Copiar URL" no preview com feedback visual (toast "Copiado!")
8. Validacao: Label e Source obrigatorios, pagina destino obrigatoria, sem caracteres especiais nos UTM params (auto-sanitize para kebab-case)
9. Ao salvar, link e persistido em Supabase na tabela `utm_links` vinculado ao projeto ativo
10. Apos salvar, retorna a lista de links com o novo link destacado

---

#### Story 2.2: Links Table & CRUD

> Como **membro da equipe interna**,
> eu quero ver, buscar, editar, duplicar e excluir meus links UTM em uma tabela organizada,
> para que eu tenha controle completo sobre todos os links do projeto.

**Acceptance Criteria:**

1. Tabela de links na pagina `/links` exibe: Label, URL encurtada, Source, Medium, Campaign, Data de criacao, Acoes
2. Busca em tempo real filtra por label, source, medium ou campaign
3. Ordenacao clicavel por qualquer coluna (asc/desc)
4. Acoes por linha: Copiar URL (clipboard), Editar (abre formulario preenchido), Duplicar (cria copia com sufixo "-copy"), Excluir (com confirmacao)
5. Paginacao com 20 itens por pagina
6. Estado vazio: mensagem "Nenhum link criado — use o botao acima para comecar" com CTA
7. Dados carregados via Server Components com loading skeleton
8. Responsivo: tabela vira cards empilhados no mobile

---

#### Story 2.3: Short Links & Redirect Engine

> Como **membro da equipe interna**,
> eu quero que cada link UTM tenha uma URL curta compartilhavel,
> para que eu use em canais com limite de caracteres (WhatsApp, bio, SMS).

**Acceptance Criteria:**

1. Ao criar um link UTM, um `short_slug` e gerado automaticamente (6 chars alfanumerico, ex: `a3xK9m`)
2. Rota `/r/[slug]` implementada — ao acessar, faz redirect 302 para a `full_url` do link correspondente
3. Antes do redirect, registra o clique na tabela `tracking_events` com: tracking_id (gerado ou lido de cookie), timestamp, UTM params do link, referrer, user_agent, ip_hash
4. Short URL exibida na tabela de links e no formulario pos-criacao (ex: `potencia-tracking.vercel.app/r/a3xK9m`)
5. Botao "Copiar Short URL" distinto do "Copiar URL Completa"
6. Se slug nao encontrado, retorna pagina 404 amigavel
7. Redirect deve ser rapido (<200ms) — logica minima antes do 302
8. Cookie `_ptk_id` (tracking_id) setado no browser do visitante com expiracao de 180 dias para associacao futura de conversoes

---

### Epic 3: Tracking Engine

**Goal:** Implementar o motor de tracking completo — script standalone injetavel em qualquer site que captura cliques e conversoes, API de ingestao robusta, e associacao inteligente de eventos via tracking_id — transformando o sistema de "gerenciador de links" em "plataforma de tracking".

---

#### Story 3.1: Tracking Script (Vanilla JS)

> Como **membro da equipe interna**,
> eu quero um script JS que eu injete em qualquer site/landing page para capturar automaticamente UTM params e cliques,
> para que todo trafego com UTM seja rastreado independente do dominio.

**Acceptance Criteria:**

1. Script standalone em vanilla JS (`/public/tracking/pt-tracker.js`) sem dependencias externas, minificado < 15KB
2. Ao carregar, le UTM params da URL (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) e persiste em localStorage com namespace configuravel
3. Gera ou recupera `tracking_id` unico (UUID v4) e persiste em cookie `_ptk_id` com expiracao de 180 dias
4. Envia evento `pageview` para a API `/api/track` com: tracking_id, timestamp, UTM params, page_url, referrer, user_agent
5. Expoe metodo global `PotenciaTracker.trackConversion(data)` para o site chamar em eventos de conversao (ex: submit de formulario) com payload: email, nome, telefone, order_id (todos opcionais)
6. Configuracao via atributo data no script tag: `<script src="...pt-tracker.js" data-project="slug-do-projeto" data-api="https://potencia-tracking.vercel.app"></script>`
7. Deduplicacao: nao envia pageview duplicado na mesma sessao (sessionStorage flag)
8. Nao impacta LCP da pagina hospedeira — carregamento async/defer obrigatorio

---

#### Story 3.2: Tracking Ingestion API

> Como **sistema de tracking**,
> eu quero uma API que receba eventos de cliques e conversoes do script e dos short links,
> para que todos os eventos sejam persistidos de forma segura e confiavel.

**Acceptance Criteria:**

1. Endpoint `POST /api/track` recebe eventos com payload: `{ project_slug, tracking_id, event_type, timestamp, utm_*, page_url, referrer, user_agent, conversion_data? }`
2. Validacao do payload: project_slug deve existir, event_type deve ser `pageview|click|conversion`, UTM params sanitizados
3. IP do request e hasheado (SHA-256 + salt) antes de salvar — nunca armazena IP raw (LGPD)
4. Rate limiting: maximo 100 requests/minuto por IP para prevenir abuse
5. CORS configurado: aceita requests de qualquer origem (o script roda em sites externos)
6. Resposta rapida: retorna 202 Accepted imediatamente, processamento pode ser async
7. Conversoes com `tracking_id` existente sao associadas ao evento de pageview/click original (mesmo registro ou lookup)
8. Conversoes sem tracking_id previo criam registro "orfao" com flag `is_orphan: true`
9. Endpoint `GET /api/track/health` retorna status da API para monitoramento

---

#### Story 3.3: Script Hosting & Integration Guide

> Como **membro da equipe interna**,
> eu quero instrucoes claras de como instalar o script de tracking em qualquer site,
> para que eu consiga ativar tracking sem depender de desenvolvedor.

**Acceptance Criteria:**

1. Pagina `/settings/tracking` no dashboard exibe o snippet de instalacao do script pronto para copiar, com `data-project` e `data-api` ja preenchidos para o projeto ativo
2. Snippet inclui tag `<script>` com atributos `async defer` e configuracao correta
3. Secao de "Tracking de Conversao" mostra exemplo de codigo JS para chamar `PotenciaTracker.trackConversion()` em formularios
4. Botao "Verificar Instalacao" faz ping para checar se o script esta respondendo do dominio configurado no projeto
5. Status de tracking visivel no header do dashboard: badge verde "Tracking Ativo" (recebeu eventos nas ultimas 24h) ou amarelo "Sem dados recentes"
6. Guia inclui exemplos para: HTML estatico, WordPress (via header/footer plugin), e React/Next.js

---

### Epic 4: Dashboard & Analytics

**Goal:** Entregar o dashboard analitico completo com KPIs em tempo real, graficos de tendencia, tabela de conversoes com filtros avancados e export — transformando dados brutos de tracking em insights acionaveis para a equipe.

---

#### Story 4.1: KPI Cards & Overview Stats

> Como **membro da equipe interna**,
> eu quero ver os principais indicadores de performance do projeto ativo na tela inicial,
> para que eu saiba instantaneamente como as campanhas estao performando.

**Acceptance Criteria:**

1. Pagina `/` (dashboard) exibe 4 KPI cards: Total de Cliques, Total de Conversoes, Taxa de Conversao (%), Top Source (maior volume)
2. Cada card mostra valor atual e variacao percentual vs periodo anterior (ex: "+12% vs semana passada") com seta verde/vermelha
3. Cards respondem ao filtro de periodo ativo (padrao: ultimos 30 dias)
4. Dados carregados via Server Components com skeleton loading
5. KPIs sao calculados a partir da tabela `tracking_events` filtrada por `project_id` do projeto ativo
6. Estado vazio: cards mostram "0" com mensagem "Instale o script de tracking para comecar a receber dados"
7. Auto-refresh a cada 60 segundos com indicador visual de "ultima atualizacao"

---

#### Story 4.2: Charts & Source Ranking

> Como **membro da equipe interna**,
> eu quero visualizar graficos de tendencia e ranking de origens de trafego,
> para que eu identifique quais canais e periodos geram mais resultados.

**Acceptance Criteria:**

1. Grafico de linha (Recharts) mostrando cliques e conversoes ao longo do tempo, com granularidade automatica (por hora se <3 dias, por dia se <90 dias, por semana se >90 dias)
2. Grafico de barras horizontais com ranking das top 10 sources por volume de cliques, com taxa de conversao sobreposta
3. Ambos os graficos respondem ao filtro de periodo e projeto ativo
4. Tooltip nos graficos exibe valores exatos ao passar o mouse
5. Toggle para alternar entre "Cliques" e "Conversoes" como metrica primaria nos graficos
6. Graficos responsivos — redimensionam corretamente em mobile sem perder legibilidade
7. Cores consistentes por source entre graficos (Instagram = rosa, YouTube = vermelho, etc.)

---

#### Story 4.3: Conversions Table & Export

> Como **membro da equipe interna**,
> eu quero ver a lista completa de conversoes com dados de contato e exportar para planilha,
> para que eu acompanhe cada lead individualmente e compartilhe com a equipe.

**Acceptance Criteria:**

1. Pagina `/conversions` exibe tabela com colunas: Data/Hora, Nome, Email, Telefone, Source, Medium, Campaign, Pagina de Origem
2. Busca em tempo real filtra por nome, email, telefone ou qualquer UTM param
3. Ordenacao clicavel por qualquer coluna (asc/desc), padrao: mais recentes primeiro
4. Paginacao com 25 itens por pagina e contagem total
5. Botao "Exportar CSV" gera arquivo com encoding UTF-8 BOM, incluindo todas as conversoes filtradas (nao apenas a pagina atual)
6. Filtro por periodo integrado com o seletor global do dashboard
7. Rows clicaveis expandem para ver detalhes completos: todos os UTM params, tracking_id, referrer, user_agent, timestamp do clique original
8. Responsivo: tabela com scroll horizontal no mobile, colunas prioritarias (Nome, Source, Data) visiveis primeiro

---

#### Story 4.4: Global Filters & Period Selector

> Como **membro da equipe interna**,
> eu quero filtrar todos os dados do dashboard por periodo, canal e campanha,
> para que eu analise performance de acoes especificas em janelas de tempo relevantes.

**Acceptance Criteria:**

1. Barra de filtros persistente no topo do dashboard (abaixo do header) com: Period Selector, Source filter, Medium filter, Campaign filter
2. Period Selector com presets: Hoje, Ultimos 7 dias, Ultimos 30 dias (padrao), Ultimos 90 dias, Custom (date range picker)
3. Filtros Source, Medium e Campaign sao dropdowns populados dinamicamente com valores existentes nos dados do projeto
4. Filtros sao composiveis — selecionar Source "instagram" + Campaign "lancamento-2026" mostra intersecao
5. Todos os componentes do dashboard (KPIs, graficos, tabelas) reagem aos filtros em tempo real sem reload
6. Estado dos filtros persiste na URL via query params (ex: `/?period=30d&source=instagram`) para compartilhamento de views
7. Botao "Limpar Filtros" reseta todos para o padrao
8. Badge com contagem de filtros ativos visivel quando algum filtro esta aplicado

---

## 7. Checklist Results Report

### Validation Summary

- **Overall Completeness:** ~88% (pos-fixes)
- **MVP Scope:** Just Right
- **Readiness:** READY FOR ARCHITECT

| Category | Status |
|----------|--------|
| 1. Problem Definition & Context | **PASS** (90%) |
| 2. MVP Scope Definition | **PASS** (85%) |
| 3. User Experience Requirements | **PARTIAL** (75%) — user flows serao detalhados pelo @ux-design-expert |
| 4. Functional Requirements | **PASS** (92%) |
| 5. Non-Functional Requirements | **PASS** (90%) |
| 6. Epic & Story Structure | **PASS** (95%) |
| 7. Technical Guidance | **PASS** (90%) |
| 8. Cross-Functional Requirements | **PARTIAL** (80%) — monitoring sera definido pelo @architect |
| 9. Clarity & Communication | **PARTIAL** (80%) — diagramas serao criados pelo @architect |

### Remaining Items (delegated)

- User flows detalhados → `@ux-design-expert`
- Diagrama de arquitetura → `@architect`
- Monitoring e alerting strategy → `@architect` / `@devops`
- Schema detalhado com indexes → `@data-engineer`

---

## 8. Next Steps

### 8.1 UX Expert Prompt

> `@ux-design-expert` — Revise o PRD em `docs/prd.md` e crie o design system e especificacoes visuais para o Potencia Tracking. Foque nas 7 telas core (Login, Dashboard, Links Manager, Link Generator, Conversoes, Projetos, Settings). Use as skills `ui-ux-pro-max`, `frontend-design`, `tailwind-v4-shadcn` para criar componentes de alta qualidade visual. Considere dark-mode-first, WCAG AA, e responsive design.

### 8.2 Architect Prompt

> `@architect` — Revise o PRD em `docs/prd.md` e crie o documento de arquitetura para o Potencia Tracking. Stack definida: Next.js 16 (App Router), Supabase (PostgreSQL + Auth + RLS), Tailwind CSS 4 + shadcn/ui, Recharts 3, Vercel. Foque em: schema detalhado do Supabase, arquitetura do tracking script standalone, API routes design, autenticacao SSR com middleware, e estrategia de short links via `/r/[slug]`.

---

_Potencia Tracking PRD v0.1 — Morgan (PM) — 2026-03-10_
