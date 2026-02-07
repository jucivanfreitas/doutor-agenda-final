# PlenoPsi — Histórico de Atividades (Agentes)

Registro de tarefas realizadas e pendentes para consulta de agentes futuros.

---

## ✅ Sprint 1 — Setup Inicial (07/02/2026)

### Contexto
Projeto PlenoPsi criado com Next.js 16, React 19, TypeScript e Tailwind CSS 4.  
Repositório: [datavisio-tech/pleno-psi](https://github.com/datavisio-tech/pleno-psi)  
Branch principal: `main`

### Workflow executado

| Etapa | Resultado | Status |
|---|---|---|
| **Issue** | [#3](https://github.com/datavisio-tech/pleno-psi/issues/3) — Setup inicial do projeto | ✅ Concluído |
| **Branch** | `feature/setup-init` (criada a partir de `main`) | ✅ Concluído |
| **Desenvolvimento** | Metadata pt-BR, landing page PlenoPsi, `.env.example`, `.gitignore` | ✅ Concluído |
| **Pull Request** | [#4](https://github.com/datavisio-tech/pleno-psi/pull/4) — feat: Setup inicial do PlenoPsi | ✅ Concluído |
| **Code Review** | Aprovado com comentário detalhado | ✅ Concluído |
| **Merge** | Concluído em `main`, branch remota deletada | ✅ Concluído |

### Arquivos alterados
- `app/layout.tsx` — Metadata personalizado (título, descrição, keywords, lang pt-BR)
- `app/page.tsx` — Landing page com cards: Agenda, Financeiro, Pacientes
- `.env.example` — Template de variáveis de ambiente (DATABASE_URL, NEXTAUTH, API)
- `.gitignore` — Exceção para `.env.example`

### Configuração do repositório
- Repositório git inicializado em `pleno-psi/` (separado do repo `jucivanfreitas/projetos`)
- Remote: `https://github.com/datavisio-tech/pleno-psi.git`
- Documentação do remoto integrada: LICENSE.md, PRIVACY.md, TERMS.md, README.md

---

## 📋 Próximas tarefas sugeridas

| Prioridade | Tarefa | Descrição |
|---|---|---|
| Alta | Autenticação | Implementar NextAuth.js com login/cadastro de psicólogos |
| Alta | Banco de dados | Configurar Prisma + PostgreSQL com models iniciais |
| Alta | Layout base | Criar sidebar, header e estrutura de navegação |
| Média | CRUD Pacientes | Cadastro, listagem, edição e exclusão de pacientes |
| Média | Agenda | Sistema de agendamento de consultas com calendário |
| Média | Financeiro | Controle de recebimentos e despesas |
| Baixa | Dashboard | Painel com métricas e resumos |
| Baixa | Deploy | Configurar deploy na VPS Hostinger |

---

## 📌 Convenções do projeto

- **Branch naming**: `feature/<nome>`, `fix/<nome>`, `hotfix/<nome>`
- **Commits**: Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- **Workflow**: Issue → Branch → Desenvolvimento → PR → Code Review → Merge
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- **Node**: Verificar compatibilidade com versão local

---

> Última atualização: 07/02/2026
