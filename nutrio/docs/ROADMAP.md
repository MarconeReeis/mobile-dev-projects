# Roadmap — Nutrio

Diário alimentar e acompanhamento de nutrientes. Primeiro um app pessoal; se funcionar bem, um produto.

Legenda: `[ ]` a fazer · `[~]` em andamento · `[x]` feito

---

## Fase 0 — Fundação ✅

- [x] Projeto React + Vite + TypeScript
- [x] Tailwind CSS v4 com o design system do protótipo (cores oklch, fontes Figtree/Urbanist)
- [x] Componentes shadcn/ui usados no protótipo
- [x] TanStack Router (rotas por arquivo) + TanStack Query
- [x] Shell responsivo: menu lateral no desktop, navegação inferior no celular, safe areas
- [x] Camada de domínio pura (`src/domain/nutrition`) com testes das regras de cálculo
- [x] Formatação pt-BR: números com vírgula, DD/MM/AAAA, datas locais sem UTC
- [x] Vitest, oxlint, Prettier

## Fase 1 — Telas com dados mockados (portar o layout do Lovable)

Objetivo: o app inteiro navegável e fiel ao protótipo, rodando sobre um repositório em memória.

- [x] Camada de dados: interfaces de repositório (`FoodsRepository`, `MealsRepository`, `GoalsRepository`, `ProfileRepository`) + implementação em memória com seed de demonstração
- [x] Hooks de query/mutation por feature (leitura de refeições, alimentos, metas e perfil; todas as escritas de refeições invalidam o cache)
- [x] **Resumo:** saudação, seletor de data (data na URL `?data=`), anel de calorias, barras de macros, demais nutrientes, refeições do dia, gráfico de 7 dias com alternativa textual
- [x] **Refeições:** lista por data (`?data=`), total do dia, sugestões, criar/editar (nome, horário, observações), reordenar, duplicar para outra data, excluir com confirmação, editar quantidade (com conversão porção ↔ g/ml), mover item para outra refeição/data, remover item
- [x] **Registrar alimento:** busca sem acento, recentes, favoritos, quantidade em g/ml/porção com vírgula, prévia dos nutrientes e cadastro de alimento novo sem sair do registro
- [x] **Alimentos:** busca por nome/marca, filtro por categoria, favoritos, arquivados, detalhe completo, criar/editar (vazio = não informado, vírgula e milhar pt-BR), porções, duplicar, arquivar/restaurar e excluir só quando nunca registrado
- [x] **Metas:** meta × limite por nutriente (principais e opcionais), versões por data de início sem alterar dias anteriores, substituição na mesma data com confirmação, aviso ao aplicar em datas passadas, histórico com períodos, "usar como base", excluir versão, estimativa 4/4/9 informativa
- [x] **Perfil:** nome, nascimento, peso, altura, atividade e objetivo (opcionais), fuso horário com fusos do Brasil em destaque (define o "hoje" do app), exportação dos dados em JSON, exclusão de conta com confirmação digitada, termos e aviso de privacidade marcados como pendentes, aviso de que não substitui profissional
- [x] Estados de carregamento, vazio e erro; toasts de feedback; prevenção de envio duplo em todas as telas
- [ ] Metas no celular: barra fixa de salvar (hoje o botão fica no fim da página)

## Fase 2 — Persistência e contas

- [x] **Back-end decidido: Supabase** (Postgres + RLS + Auth), região São Paulo. Motivos: dados relacionais, RLS pedido no escopo, exclusão em cascata, relatórios e modo nutricionista em SQL, sem lock-in
- [x] Schema, RLS e funções (RPC) aplicados no projeto Supabase (São Paulo) + 33 testes pgTAP passando no banco real (dois usuários, isolamento, snapshot, metas, exclusão de conta)
- [x] Repositórios Supabase (`createSupabaseRepositories`) com tipos gerados do banco; o app usa Supabase quando `.env.local` existe e o mock quando não
- [ ] Offline no MVP: cache persistido do TanStack Query + fila de escritas (avaliar PowerSync depois)
- [~] Autenticação: cadastro (com confirmação por e-mail), login, sair, recuperação e redefinição de senha, rotas protegidas. Falta testar de ponta a ponta com uma conta real
- [ ] Testes de isolamento rodando no CI (dois usuários não enxergam dados um do outro)
- [x] Trocar o repositório em memória pelo remoto, sem mudar as telas
- [~] Exportação dos dados (JSON) e exclusão de conta implementadas no Supabase (exclusão testada no banco); falta testar pelo app

## Fase 3 — App mobile

- [ ] Capacitor (iOS/Android), ícones e splash
- [ ] Teclado numérico decimal, haptics, status bar
- [ ] PWA instalável como alternativa
- [ ] Publicação TestFlight / Play Console (uso interno)

## Fase 4 — Qualidade e produto

- [ ] Testes de componente nas telas críticas e testes E2E (Playwright) do fluxo completo
- [ ] CI (GitHub Actions): lint, typecheck, testes, build
- [ ] Monitoramento de erros sem dados pessoais
- [ ] Modo escuro (tokens já preparados com `.dark`)
- [ ] Acessibilidade: revisão com leitor de tela e contraste
- [ ] Termos de uso e aviso de privacidade (LGPD) escritos de verdade

---

## Ideias para o futuro

Não entram no escopo agora, ficam anotadas.

**Registro mais rápido**

- Leitor de código de barras
- Base de composição pública (TACO/TBCA) para importar alimentos
- Reconhecimento de alimento por foto
- Refeições salvas / "combos" (ex.: "meu café de sempre")
- Copiar dia inteiro; registrar por voz

**Acompanhamento**

- Água (o NutriMio já tem essa lógica)
- Peso e medidas com gráfico de evolução
- Relatórios semanais/mensais, médias por nutriente
- Lembretes de refeição (notificações locais)
- Integração com Apple Health / Google Fit

**Produto / comercial**

- Modo nutricionista: profissional define metas e acompanha pacientes
- Plano gratuito + assinatura (relatórios, exportação PDF, sincronização entre aparelhos)
- Compartilhar relatório em PDF com o profissional
- Internacionalização (o nome "Nutrio" funciona em PT e EN)

---

## Decisões em aberto

| Decisão            | Opções                                                        | Observações                                                                              |
| ------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Back-end           | ~~Supabase × Firebase~~ **Supabase** (decidido em 22/10/2026) | Firebase venceria em offline nativo; compensado com cache persistido e fila de escritas. |
| Plataforma inicial | PWA × Capacitor desde já                                      | Começar web/PWA e adicionar Capacitor na fase 3.                                         |
| Monorepo           | Pasta em `mobile-dev-projects` × repositório próprio          | Para comercializar, um repositório próprio facilita CI e colaboradores.                  |
