# Auditoria do Projeto — Pleno Psi

---

    - Data: 2026-02-15
    - Autor: VSCode Agent
    - Tipo: chore/merge
    - Descrição curta: Merge e fechamento da branch `implementacao-de-logs`.
    - Detalhes: A branch `implementacao-de-logs` foi mesclada em `main` e removida. Contém correções no fluxo de Checkout/Stripe, melhorias de logging, proteção contra race conditions e adição da página de confirmação de assinatura (`/subscription/success`).
    - Arquivos alterados / adicionados (resumo):
      - src/app/api/stripe/webhook/route.ts (modificado — logs e tratamento de eventos)
      - src/actions/create-stripe-checkout/index.ts (modificado — envia `metadata.userId`, `customer_email`, success_url atualizado)
      - src/app/subscription/success/page.tsx (novo — polling server-side e redirecionamento)
      - src/lib/logger.ts (novo/ajustado — logging centralizado)
      - src/lib/action-wrapper.ts (novo — wrapper para instrumentação de actions)
      - src/app/error.tsx (novo — Error Boundary usando logger)
      - diversos arquivos instrumentados com logs e pequenas correções (ver histórico do commit)
    - Branch/PR: implementacao-de-logs (merged into `main`)
    - Notas de deploy/testes:
      1. `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
      2. `npm run dev` para iniciar o app.
      3. Realizar um novo checkout (novas sessões contêm `metadata.userId`).
      4. Conferir logs: `stripe.webhook.received`, `stripe.webhook.updated-user`, `subscription.success: page requested`.
      5. Verificar redirecionamento automático para `/dashboard` após webhook atualizar o DB.

    ---

    - Data: 2026-02-15
    - Autor: VSCode Agent
    - Tipo: feature
    - Descrição curta: Adicionado `system_settings` e suporte a metadata-driven app name (Pleno PSI).
    - Detalhes: Criada tabela `system_settings` e serviço `src/services/system.service.ts` para obter nome da aplicação. Atualizada `src/app/layout.tsx` para usar `generateMetadata()` buscando o nome do banco. Prefixo do logger atualizado para `[PLENO-PSI]`.
    - Arquivos alterados / adicionados:
      - src/db/schema.ts (adicionado `system_settings`)
      - src/services/system.service.ts (novo)
      - src/app/layout.tsx (modificado — usa `generateMetadata`)
      - src/lib/logger.ts (modificado — prefixo `[PLENO-PSI]`)
    - Branch/PR: migration/pleno-psi
    - Notas de deploy/testes:
      1. Criar migration correspondente (drizzle) e aplicá-la no banco de dados.
      2. Inserir linha seed em `system_settings` com `app_name = "Pleno PSI"`.
      3. Iniciar a aplicação e verificar que a metadata do site é `Pleno PSI`.
      - Data: 2026-02-15
      - Autor: VSCode Agent
      - Tipo: feature
      - Descrição curta: Atualização do Sidebar com `system_settings`.
      - Detalhes: Modificado o Sidebar para usar `system_settings` para nome e logo dinâmicos.
      - Arquivos alterados:
        - src/app/(protected)/layout.tsx (modificado — passa `system_settings` para Sidebar)
        - src/app/(protected)/_components/app-sidebar.tsx (modificado — usa `system_settings` para nome e logo dinâmicos)

    ---

    - Data: 2026-02-15
    - Autor: VSCode Agent
    - Tipo: infra/migration
    - Descrição curta: Migration para `system_settings` criada e seed aplicada.
    - Detalhes: Adicionada migration SQL em `drizzle/20260215_create_system_settings.sql` que cria a tabela `system_settings` e insere o registro inicial (`id='system', app_name='Pleno PSI'`).
    - Arquivos alterados / adicionados:
      - drizzle/20260215_create_system_settings.sql (novo)
      - src/db/schema.ts (modificado — adicionada definição `system_settings`)
      - src/services/system.service.ts (novo)
      - src/app/layout.tsx (modificado)
      - src/lib/logger.ts (modificado)
    - Branch/PR: migration/pleno-psi
    - Notas de deploy/testes:
      1. Aplicar migration pelo fluxo do projeto (drizzle). Exemplo:
         `npx drizzle-kit migrate` (ver `drizzle.config.ts` e adaptações do projeto).
      2. Confirmar que `SELECT * FROM system_settings;` retorna o registro `system`.
      3. Iniciar a aplicação e verificar a metadata da aplicação exibindo `Pleno PSI`.

    - Autor: VSCode Agent
    - Tipo: bugfix
    - Descrição curta: Corrige fluxo de atualização de plano via webhook Stripe.
    - Detalhes: Adicionados logs ao webhook Stripe (`src/app/api/stripe/webhook/route.ts`), tratamento do evento `checkout.session.completed`, melhoria no tratamento de `invoice.paid` (busca de metadata no invoice e na subscription), confirmação de envio de `metadata.userId` no action `create-stripe-checkout` e log do número/resultado da atualização no banco.
    - Arquivos alterados:
      - src/app/api/stripe/webhook/route.ts
      - src/actions/create-stripe-checkout/index.ts
      - docs/AUDIT.md
    - Branch/PR: implementacao-de-logs
    - Notas de deploy/testes:
      1. Executar `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
      2. Fazer compra de subscrição via UI.
      3. Confirmar no terminal que o webhook foi chamado e que logs incluem `type`, `sessionId`/`invoiceId`, `customer`, `metadata` e `userId`.
      4. Confirmar que o registro do usuário foi atualizado no banco (campo `plan` e `stripeCustomerId`).
      5. Recarregar `/dashboard` e validar que o HOC `with-authentication` não mais loga "user has no plan" para o usuário atualizado.

      ---

      - Data: 2026-02-15
      - Autor: VSCode Agent
      - Tipo: bugfix
      - Descrição curta: Corrige race condition entre redirect do Checkout e webhook Stripe.
      - Detalhes: Para evitar que o usuário seja redirecionado ao `dashboard` antes do webhook atualizar o plano, alterei o `success_url` do Checkout para incluir o `session_id` e implementei a página de confirmação `src/app/subscription/success/page.tsx` (Server Component). A página realiza polling server-side por até 5 segundos verificando se o campo `plan` do usuário foi atualizado; redireciona para `/dashboard` quando detectado. Adicionei logs em pontos chave (`session_id`, checagens de plano, tempo de espera).
      - Arquivos alterados / adicionados:
        - src/actions/create-stripe-checkout/index.ts (updated `success_url`, log metadata)
        - src/app/subscription/success/page.tsx (new)
        - src/app/api/stripe/webhook/route.ts (logging + event handling improvements)
        - docs/AUDIT.md
      - Branch/PR: implementacao-de-logs
      - Notas de deploy/testes:
        1. Autenticar Stripe CLI e executar `stripe listen --forward-to localhost:3000/api/stripe/webhook`.
        2. Iniciar a aplicação (`npm run dev`) e abrir o fluxo de compra.
        3. Após completar o checkout, o Stripe irá redirecionar para `/subscription/success?session_id=...`.
        4. Conferir logs: `subscription.success: page requested`, `subscription.success: plan check` e `stripe.webhook.db.update` com `userId`/`result`.
        5. Verificar que, após o webhook atualizar o DB, a página redireciona para `/dashboard`.

---

- Data: 2026-02-15
- Autor: VSCode Agent
- Tipo: feature
- Descrição curta: Criação da base estrutural multi-tenant (clinics e users_to_clinics).
- Detalhes: Adicionadas migrations para as tabelas `clinics` e `users_to_clinics`. Essas tabelas formam a base da arquitetura multi-tenant; a associação entre usuários e clínicas foi criada como `users_to_clinics` para manter consistência com `src/db/schema.ts`. As referências `clinic_id` nas tabelas existentes permanecem inalteradas e serão tratadas na Fase 2.
- Arquivos alterados / adicionados:
  - drizzle/20260215_create_clinics.sql (novo)
  - drizzle/20260215_create_users_to_clinics.sql (novo)
  - src/db/schema.ts (já contém definições compatíveis com as novas migrations)
- Branch/PR: migration/multi-tenant-phase1
- Notas de deploy/testes:
  1. Aplicar migrations com `npx drizzle-kit migrate`.
  2. Confirmar que `SELECT * FROM clinics;` e `SELECT * FROM users_to_clinics;` retornam resultados (ou vazios) sem erro.
  3. Iniciar a aplicação (`npm run dev`) e validar que não há regressões aparentes.

## O que é a aplicação

Pleno Psi é uma aplicação web para gerenciamento de clínicas, médicos, pacientes e agendamentos. Fornece painel administrativo, CRUD para médicos e pacientes, agendamento de consultas com verificação de horários disponíveis e integração com Stripe para funcionalidades de compra/subscrição.

## Estrutura principal de pastas e arquivos

Raiz do projeto (visão resumida):

- components.json
- drizzle.config.ts
- eslint.config.mjs
- next.config.ts
- package.json
- postcss.config.mjs
- README.md
- tsconfig.json
- public/
- src/

  - middleware.ts
  - actions/

    - add-appointment/
      - index.ts
      - schema.ts
    - create-clinic/
      - index.ts
    - create-stripe-checkout/
      - index.ts
    - delete-appointment/
      - index.ts
    - delete-doctor/
      - index.ts
    - delete-patient/

      ````markdown
      # Auditoria do Projeto — Pleno Psi

      ## O que é a aplicação

      Pleno Psi é uma aplicação web para gerenciamento de clínicas, médicos, pacientes e agendamentos. Fornece painel administrativo, CRUD para médicos e pacientes, agendamento de consultas com verificação de horários disponíveis e integração com Stripe para funcionalidades de compra/subscrição.

      ## Estrutura principal de pastas e arquivos

      Raiz do projeto (visão resumida):

      - components.json
      - drizzle.config.ts
      - eslint.config.mjs
      - next.config.ts
      - package.json
      - postcss.config.mjs
      - README.md
      - tsconfig.json
      - public/
      - src/

        - middleware.ts
        - actions/
          - add-appointment/
            - index.ts
            - schema.ts
          - create-clinic/
            - index.ts
          - create-stripe-checkout/
            - index.ts
          - delete-appointment/
            - index.ts
          - delete-doctor/
            - index.ts
          - delete-patient/
            - index.ts
          - get-available-times/
            - index.ts
          - upsert-doctor/
            - index.ts
            - schema.ts
          - upsert-patient/
            - index.ts
            - schema.ts
        - app/

          - globals.css
          - layout.tsx
          - page.tsx
          - (protected)/

            - layout.tsx
            - \_components/
              - app-sidebar.tsx
            - appointments/
              - page.tsx
              - \_components/
                - add-appointment-button.tsx
                - add-appointment-form.tsx
                - table-actions.tsx
                - table-columns.tsx
            - clinic-form/
              - page.tsx
              - \_components/
                - form.tsx
            - dashboard/
              - page.tsx
              - \_components/
                - appointments-chart.tsx
                - date-picker.tsx
                - stats-cards.tsx
                - top-doctors.tsx
                - top-specialties.tsx
            - doctors/
              - page.tsx
              - \_components/
                - add-doctor-button.tsx
                - doctor-card.tsx
            - patients/
              - page.tsx

            ***

            - Data: 2026-02-15
            - Autor: VSCode Agent
            - Tipo: chore/rebranding
            - Descrição curta: Centralização de branding e rebranding para "Pleno PSI".
            - Detalhes: Adicionado módulo `src/lib/branding.ts` para obter branding (nome, logo, cores) a partir de `system_settings`. Criado `public/favicon.svg` e atualizados `package.json` (`name` -> `pleno-psi`) e `README.md` para refletir o novo nome. Essas mudanças são não-intrusivas e preservam o uso do serviço `src/services/system.service.ts` como fonte única de verdade para o nome da aplicação.
            - Arquivos alterados / adicionados:

              - src/lib/branding.ts (novo)
              - public/favicon.svg (novo)
              - package.json (modificado — `name` atualizado para `pleno-psi`)
              - README.md (modificado — título e descrição atualizados)

              - \_components/

            - subscription/
              - page.tsx
              - \_components/

          - api/
            - auth/
              - [...all]/
            - stripe/
              - webhook/
          - authentication/
            - page.tsx
            - components/
              - login-form.tsx
              - sign-up-form.tsx
          - new-subscription/
            - page.tsx

        - components/
          - ui/
            - alert-dialog.tsx
            - avatar.tsx
            - badge.tsx
            - button.tsx
            - calendar.tsx
            - card.tsx
            - chart.tsx
            - data-table.tsx
            - dialog.tsx
            - dropdown-menu.tsx
            - form.tsx
            - input.tsx
            - label.tsx
            - page-container.tsx
            - popover.tsx
            - progress.tsx
            - select.tsx
            - separator.tsx
            - sheet.tsx
            - sidebar.tsx
            - skeleton.tsx
            - sonner.tsx
            - table.tsx
            - tabs.tsx
            - tooltip.tsx
        - data/
          - get-dashboard.ts
        - db/
          - index.ts
          - schema.ts
        - helpers/
          - currency.ts
          - time.ts
        - hocs/
          - with-authentication.tsx
        - hooks/
          - use-mobile.ts
        - lib/
          - auth-client.ts
          - auth.ts
          - next-safe-action.ts
          - utils.ts
        - providers/
          - react-query.tsx

      ## Como rodar em desenvolvimento

      Pré-requisitos:

      - Node.js (versão compatível com o projeto). Instale as dependências do projeto antes de rodar.

      Passos rápidos:

      1. Instalar dependências:

      ```bash
      npm install
      ```

      2. Configurar variáveis de ambiente:

      - Verifique o arquivo `.env` na raiz do projeto e ajuste as variáveis necessárias (`DATABASE_URL`, `NEXT_PUBLIC_STRIPE_*`, etc.).

      3. Rodar em modo de desenvolvimento:

      ```bash
      npm run dev
      ```

      O servidor de desenvolvimento do Next.js ficará disponível normalmente em `http://localhost:3000`.

      ## Observação importante sobre Stripe (desenvolvimento local)

      Durante o desenvolvimento, o Stripe CLI/SDK local está em:

      `C:\Users\juciv\Downloads\stripe_1.35.0_windows_x86_64`

      Antes de testar ou usar as funcionalidades de compra/subscrição, execute o login do Stripe CLI nessa máquina. Exemplo (a partir da pasta acima):

      ```powershell
      cd C:\Users\juciv\Downloads\stripe_1.35.0_windows_x86_64
      ./stripe login
      ```

      Observações:

      - Você pode adicionar essa pasta ao `PATH` do Windows para chamar `stripe` de qualquer terminal.
      - O login é necessário para que eventos de checkout / webhooks e testes de fluxo de compra funcionem corretamente em ambiente local.
      ````

    ```

    ---

    - Data: 2026-02-15
    - Autor: VSCode Agent
    - Tipo: infra/maintenance
    - Descrição curta: Aplicadas migrations multi-tenant, gerados tipos Drizzle e corrigidos erros TypeScript.
    - Detalhes: Foram adicionadas as migrations `drizzle/20260215_create_clinics.sql` e `drizzle/20260215_create_users_to_clinics.sql` e aplicadas ao banco com `npx drizzle-kit migrate`. Em seguida foi executada a geração de tipos (`npx drizzle-kit generate`) e a checagem TypeScript (`npx tsc --noEmit`). Vários erros de tipagem encontrados após a geração foram corrigidos para restaurar a integridade do projeto (callbacks tipadas, acesso seguro a campos do objeto `Invoice` do Stripe, await em `headers()` e ajuste no wrapper de logging). O código agora passa na checagem TypeScript local.
    - Arquivos alterados / adicionados:
      - drizzle/20260215_create_clinics.sql (novo)
      - drizzle/20260215_create_users_to_clinics.sql (novo)
      - src/actions/add-appointment/index.ts (modificado — tipagens e registro de action)
      - src/actions/get-available-times/index.ts (modificado — tipagens e registro de action)
      - src/app/(protected)/appointments/_components/add-appointment-form.tsx (modificado — tipagens em map)
      - src/app/api/stripe/webhook/route.ts (modificado — acesso seguro a `invoice.subscription`, normalização de `stripeSubscriptionId`)
      - src/lib/action-wrapper.ts (modificado — await `headers()` e wrapper compatível)
      - docs/AUDIT.md (modificado — esta entrada)
    - Branch/PR: migration/multi-tenant-phase1 and migration/pleno-psi (work in local branches)
    - Notas de deploy/testes:
      1. Aplicar migrations com `npx drizzle-kit migrate`.
      2. Gerar tipos com `npx drizzle-kit generate` caso o schema mude.
      3. Executar `npx tsc --noEmit` para validar tipagem.
      4. Testar fluxo de login, criação de agendamento e webhooks Stripe em ambiente local.
    ```

  ***

  - Data: 2026-02-15
  - Autor: VSCode Agent
  - Tipo: feature (multi-tenant)
  - Descrição curta: Ativação inicial multi-tenant — adição de `clinic_id` em tabelas core e serviço de resolução de clínica ativa.
  - Detalhes: Foram adicionadas migrations para incluir a coluna `clinic_id` (nullable) em `doctors`, `patients` e `appointments` e índices de consulta. Foi adicionada uma migration de backfill que tenta popular `clinic_id` em `appointments` a partir de `doctors` e `patients` quando possível; não há suposições automáticas para `doctors`/`patients` sem vínculo claro a usuários. Também foi criado `src/services/clinic.service.ts` com `getActiveClinicId(userId)` para resolver a clínica ativa a partir de `users_to_clinics`. O HOC `src/hocs/with-authentication.tsx` foi adaptado para exigir que o usuário possua uma clínica quando `mustHaveClinic` é solicitado (usa `getActiveClinicId` como fallback).
  - Arquivos alterados / adicionados:
    - drizzle/20260215_add_clinic_id_to_core_tables.sql (novo)
    - drizzle/20260215_backfill_clinic_id_core_tables.sql (novo)
    - src/services/clinic.service.ts (novo)
    - src/hocs/with-authentication.tsx (modificado)
  - Branch/PR: migration/multi-tenant-phase1
  - Notas de deploy/testes:

    1. Aplicar as novas migrations: `npx drizzle-kit migrate`.
    2. Verificar linhas com `clinic_id IS NULL` após rodar o backfill e resolver manualmente se necessário.
    3. Não aplicar `ALTER ... SET NOT NULL` até confirmar que todas as linhas foram atualizadas.
    4. Executar `npx tsc --noEmit` e testar os casos listados em "Testes Obrigatórios".

    Use o bloco abaixo para registrar mudanças de código, decisões importantes e informações relevantes para auditoria.

    - Data: YYYY-MM-DD
    - Autor: Nome do autor
    - Tipo: (feature | bugfix | refactor | docs | infra)
    - Descrição curta: Uma linha descrevendo a mudança
    - Detalhes: Explicação breve do que foi alterado e por quê
    - Arquivos alterados: lista de arquivos/paths
    - Branch/PR: nome da branch ou link do PR
    - Notas de deploy/testes: passos de verificação ou riscos

    Exemplo:

    - Data: 2026-02-15
    - Autor: Felipe Rocha
    - Tipo: feature
    - Descrição curta: Implementado endpoint de criação de consulta
    - Detalhes: Adicionada action `add-appointment/index.ts` com validação e persistência no banco; atualizada UI para novo botão.
    - Arquivos alterados:
      - src/actions/add-appointment/index.ts
      - src/app/(protected)/appointments/\_components/add-appointment-button.tsx
    - Branch/PR: feature/add-appointment
    - Notas de deploy/testes: Testar criação de agendamento via UI e validar entradas inválidas.

    ***

    Arquivo criado para centralizar histórico de mudanças e instruções importantes relacionadas ao desenvolvimento local e às dependências externas (ex.: Stripe). Atualize este arquivo sempre que uma alteração relevante for feita ou quando houver mudanças de infraestrutura/fluxos críticos.

    ## Registro de ações recentes e status

    - Data: 2026-02-15

      - Ação: Criação do arquivo de auditoria `AUDIT.md` e adição inicial na raiz do projeto.
      - Status: Concluído — arquivo criado em `AUDIT.md`.

    - Data: 2026-02-15

      - Ação: Movido `AUDIT.md` para `docs/AUDIT.md` e adicionado `/docs` ao `.gitignore`.
      - Status: Concluído — arquivo agora em `docs/AUDIT.md` e `.gitignore` atualizado.

    - Data: 2026-02-15
      - Ação: Tentativa de instalar dependências e rodar a aplicação (`npm install` e `npm run dev`).
      - Resultado / Status:
        - `npm install` falhou com conflito de dependência (ERESOLVE) relacionado a `react-day-picker@8.10.1` — peer dependency exige `react` até `^18.0.0`, enquanto o projeto declarou `react@19.1.0`.
        - Ao executar `npm run dev` sem instalação bem-sucedida, o comando `next` não foi encontrado (`'next' não é reconhecido`).
        - Tentativa planejada de reinstalar com `--legacy-peer-deps` foi iniciada, mas o processo foi cancelado pelo usuário.
      - Próximos passos recomendados:
        1. Escolher uma estratégia para resolver o conflito de dependências:
           - Rebaixar `react` para uma versão compatível (por exemplo `^18.x`) ou
           - Atualizar/alterar dependências que não suportam `react@19` (verificar `react-day-picker` e bibliotecas relacionadas) ou
           - Instalar usando `npm install --legacy-peer-deps` para forçar resolução temporária.
        2. Rodar `npm install` com a estratégia escolhida.
        3. Executar `npm run dev` e verificar se `next` está presente em `node_modules` e no `package.json` como dependência.

    ***

    - Data: 2026-02-15
    - Autor: VSCode Agent
    - Tipo: bugfix
    - Descrição curta: Corrige erro de null ao acessar `session.user` no `DashboardPage` (Server Component).
    - Detalhes: O `DashboardPage` realizava uma chamada a `auth.api.getSession()` e em seguida acessava `session!.user.clinic!.id` sem tratar o caso de `session` ou `session.user.clinic` serem `null`. Em ambiente de Server Components essa leitura ocorria antes que o HOC `WithAuthentication` pudesse executar sua validação, causando um TypeError quando a sessão estava ausente. A correção adiciona checagens explícitas imediatamente após a chamada de sessão: redireciona para `/authentication` se `session` for nulo, e para `/clinic-form` se o usuário não tiver clínica associada. Assim, nunca tentamos acessar `.user` quando a sessão é nula.
    - Arquivos alterados:
      - src/app/(protected)/dashboard/page.tsx
      - docs/AUDIT.md
    - Branch/PR: main
    - Notas de deploy/testes: Reproduzir fluxo sem sessão (abrir /dashboard em navegador sem cookie de sessão) — deve redirecionar para `/authentication`. Abrir com sessão sem clínica — deve redirecionar para `/clinic-form`. Com sessão e clínica válidas, o dashboard renderiza normalmente. Verificar logs do servidor para ausência de TypeError.

    ***

    - Data: 2026-02-15
    - Autor: VSCode Agent

    ```

    ```

---

- Data: 2026-02-15
- Autor: VSCode Agent
- Tipo: infra/chore
- Descrição curta: Tentativa de instalar `shadcn sidebar-08` falhou; componente adicionado manualmente.
- Detalhes: Executei `npx shadcn@latest add sidebar-08` para aplicar o template oficial. A instalação falhou devido a um conflito de dependências (`react-day-picker@8.10.1` exige `react@^18`, enquanto o projeto usa `react@19.1.0`). Tentei novamente com `--legacy-peer-deps` e também falhou. Para não bloquear a migração, criei manualmente o componente `src/components/app-sidebar.tsx` baseado no padrão `sidebar-08`, e atualizei o layout protegido para usar `SidebarInset` e o novo componente. Mantive autenticação, tipagem e suporte multi-tenant.
- Arquivos alterados / adicionados:
  - src/components/app-sidebar.tsx (novo — implementação manual adaptada do padrão `sidebar-08`)
  - src/app/(protected)/layout.tsx (modificado — usa `AppSidebar` e `SidebarInset`)
  - docs/AUDIT.md (modificado — esta entrada)
- Branch/PR: implementacao-de-logs
- Comandos executados / tentativas:
  1. `npx shadcn@latest add sidebar-08` — falha (ERESOLVE: react-day-picker peer conflict)
  2. `npx shadcn@latest add sidebar-08 -- --legacy-peer-deps` — falha
  3. Criação manual de `src/components/app-sidebar.tsx` e atualização do layout protegido
- Notas de deploy/testes:

  1. Revisar `src/components/app-sidebar.tsx` e ajustar estilos ou ícones caso necessário.
  2. Caso prefira usar o instalador `shadcn`, escolha uma estratégia de resolução de dependências (rebaixar `react` para `^18.x` ou atualizar dependências incompatíveis) e reexecutar o comando.
  3. Testar login, navegação, logout e responsividade localmente.

     ***

     - Data: 2026-02-15
     - Autor: VSCode Agent
     - Tipo: refactor
     - Descrição curta: Migrado Sidebar custom para padrão `shadcn` `sidebar-08`.
     - Detalhes: Substituído componente de Sidebar por implementação baseada no padrão `sidebar-08` (shadcn). O novo `AppSidebar` consome `system_settings` para branding dinâmico, utiliza a sessão real (`authClient.useSession()`) para exibir dados do usuário e mantém suporte multi-tenant exibindo o nome da clínica ativa. A implementação preserva autenticação e tipagem (sem `any`). O layout protegido foi atualizado para usar `SidebarProvider` e `SidebarInset` conforme o padrão.
     - Arquivos alterados / adicionados:
       - src/components/app-sidebar.tsx (novo — componente shadcn adaptado)
       - src/app/(protected)/layout.tsx (modificado — importa e usa `AppSidebar` e `SidebarInset`)
       - src/app/(protected)/\_components/app-sidebar.tsx (mantido para compatibilidade, não utilizado)
     - Branch/PR: migration/pleno-psi (ou feature/sidebar-shadcn)
     - Notas de deploy/testes:

       1. Iniciar a aplicação em modo dev: `npm run dev`.
       2. Fazer login com usuário válido; confirmar que o Sidebar renderiza o `appName` do DB e o nome da clínica ativa.
       3. Navegar por `Dashboard`, `Pacientes`, `Médicos`, `Agendamentos`, `Assinatura` e verificar seleção ativa de rota.
       4. Testar logout via menu do rodapé.
       5. Verificar responsividade e comportamento mobile (abrir/fechar sidebar).

     - Tipo: bugfix
     - Descrição curta: Corrige erro de bundling "Can't resolve 'async_hooks'" separando logger em server/client.
     - Detalhes: Ao introduzir `AsyncLocalStorage` para contexto de request, o módulo de logger (server) importava `async_hooks`. Como `src/app/error.tsx` é um Client Component que importa `logger`, o bundler tentou resolver `async_hooks` no bundle do navegador e falhou. A solução foi separar o logger em três camadas:

       - `shared.ts`: tipos e interface (sem dependências de Node)
       - `server.ts`: implementação completa usando `node:async_hooks` e `getRequestContext`
       - `client.ts`: implementação browser-safe que usa `console` e respeita `LOG_STATUS`/`LOG_LEVEL`
       - `index.ts`: carrega dinamicamente `server` ou `client` via `require()` baseado em `typeof window` para evitar bundling de código server-only no client bundle.

       Também atualizei `src/lib/request-context.ts` para importar `AsyncLocalStorage` de `node:async_hooks` (servidor) e garanti que nenhum código client importe módulos que dependam de `async_hooks`.

     - Arquivos alterados / adicionados:

       - src/lib/logger/shared.ts (novo)
       - src/lib/logger/server.ts (novo)
       - src/lib/logger/client.ts (novo)
       - src/lib/logger/index.ts (novo)
       - src/lib/logger/config.ts (modificado)
       - src/lib/request-context.ts (modificado)
       - src/app/error.tsx (modificado — continua usando `logger`, agora client-safe)
       - src/hocs/with-authentication.tsx (modificado — instrumentação/logging)
       - src/middleware.ts (modificado — correlation id header)
       - src/lib/action-wrapper.ts (novo / modificado)
       - src/actions/add-appointment/index.ts (modificado — wrapped with logging)
       - src/actions/get-available-times/index.ts (modificado — wrapped with logging)
       - src/app/(protected)/dashboard/page.tsx (modificado — session checks)
       - docs/AUDIT.md (modificado)

     - Branch/PR: main
     - Notas de deploy/testes: Com `LOG_STATUS=ON`, iniciar a aplicação e abrir páginas client deve NÃO causar erro de "Can't resolve 'async_hooks'". Testar fluxo de erro (forçar throw em client) para validar que `error.tsx` chama `logger.error` sem bundling issues. Verificar que logs no servidor incluem `correlationId` e que logs no browser aparecem via `console` quando `LOG_STATUS=ON`.

     ```

     ```

  ```

  ---

  - Data: 2026-02-15
  - Autor: VSCode Agent
  - Tipo: infra
  - Descrição curta: Implementação inicial de logging enterprise (logger, request context, middleware, action wrapper, error boundary) e instrumentação mínima das actions.
  - Detalhes técnicos:
    - Adicionado logger centralizado em `src/lib/logger` que produz logs JSON estruturados com `timestamp`, `level`, `message`, `correlationId`, `userId` e `clinicId`. O logger respeita a variável de ambiente `LOG_STATUS` (logs apenas quando `LOG_STATUS=ON`) e permite nível através de `LOG_LEVEL`.
    - Implementado `AsyncLocalStorage` em `src/lib/request-context.ts` para armazenar `correlationId`, `userId` e `clinicId` durante a execução de actions instrumentadas.
    - Middleware (`src/middleware.ts`) foi atualizado para gerar/propagar o header `x-correlation-id` e mantivera a checagem de sessão existente.
    - Criado `withLogging` em `src/lib/action-wrapper.ts` que envolve handlers de actions, registra início/sucesso/erro e executa a operação dentro do contexto de request (via `runWithRequestContext`).
    - Instrumentadas ações de exemplo: `src/actions/add-appointment/index.ts` e `src/actions/get-available-times/index.ts` para usar `withLogging` e registrar eventos relevantes.
    - Atualizado `src/hocs/with-authentication.tsx` para registrar estado da sessão e executar renderização com contexto definido (usa `runWithRequestContext`).
    - Adicionado `src/app/error.tsx` como Error Boundary global que loga erros via `logger.error`.

  - Arquivos alterados / adicionados:
    - src/lib/logger/types.ts (novo)
    - src/lib/logger/config.ts (novo)
    - src/lib/logger/index.ts (novo)
    - src/lib/request-context.ts (novo)
    - src/lib/action-wrapper.ts (novo)
    - src/middleware.ts (modificado)
    - src/hocs/with-authentication.tsx (modificado)
    - src/actions/add-appointment/index.ts (modificado)
    - src/actions/get-available-times/index.ts (modificado)
    - src/app/error.tsx (novo)
    - docs/AUDIT.md (modificado)

  - Notas de teste:
    1. Defina `LOG_STATUS=ON` e `LOG_LEVEL=debug` no ambiente local.
    2. Rode `npm install` (resolvendo previamente conflitos de deps) e `npm run dev`.
    3. Acesse fluxos que executam as actions instrumentadas (ex.: criar agendamento, verificar horários disponíveis) e verifique a saída JSON no terminal — observe `correlationId` e `userId` presentes.
    4. Defina `LOG_STATUS` para outro valor que não `ON` e confirme que os logs não são emitidos.

  ---

  Observações:
  - Evitei uso de `any` e `as any` em novos arquivos — tipos explícitos foram adicionados para handlers instrumentados.
  - O escopo implementado foca numa instrumentação mínima e segura. Para cobertura completa, recomenda-se (próximo passo) aplicar `withLogging` a todas actions em `src/actions/` e instrumentar pontos adicionais (auth, stripe webhooks) conforme descrito em `ENTERPRISE_LOGGING_SETUP.md`.
  ```
