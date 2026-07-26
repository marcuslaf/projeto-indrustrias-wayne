# Indústrias Wayne — Gestão de Recursos e Segurança

Sistema full-stack de gestão empresarial da **Indústrias Wayne** (Universo Batman). Gerencia equipamentos, veículos e dispositivos de segurança com RBAC, dashboard interativo e audit trail. Construído com **Next.js 16 + Supabase**.

**Deploy:** https://web-green-eta-ooechjq01q.vercel.app

---

## Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Dashboard** | Cards com estatísticas, gráficos Recharts (pizza/barras), filtro por período, 3 abas (Visão Geral, Atividade, Gráficos) |
| **Gestão de Recursos** | CRUD completo com validação Zod, soft-delete, busca, detalhes com edição inline |
| **Perfil** | Edição de nome e alteração de senha |
| **Logs de Atividade** | Access logs paginados com busca e filtro |
| **Admin de Usuários** | Criação/exclusão com atribuição de papéis (admin_seguranca) |
| **RBAC** | `funcionario` (view), `gerente` (manage), `admin_seguranca` (full) |
| **Audit Trail** | Tabela `audit_logs` com trigger automático em resources |
| **Mobile** | Navbar responsiva com menu hamburger (Sheet shadcn/ui) |

---

## Stack

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **UI** | shadcn/ui, Lucide React, Recharts |
| **Backend** | Supabase (PostgreSQL, Auth, RLS) |
| **Auth** | Supabase Auth + `@supabase/ssr` |
| **Database** | PostgreSQL, RLS policies, triggers, enum types |
| **Testes** | Vitest + Testing Library |
| **CI/CD** | GitHub Actions, Husky, lint-staged, commitlint |
| **Deploy** | Vercel (projeto `industrias-wayne`), Supabase (`jxdvpluzicymdkqwzzyy`) |

---

## Estrutura

```
industrias-wayne/
├── web/                          # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/            # Login
│   │   │   ├── dashboard/        # Dashboard interativo
│   │   │   ├── resources/        # CRUD + [id] detalhes
│   │   │   ├── profile/          # Editar perfil/senha
│   │   │   ├── logs/             # Access logs
│   │   │   ├── admin/users/      # Admin de usuários
│   │   │   ├── api/seed/         # Seed de dados
│   │   │   └── api/admin/users/  # Admin API
│   │   ├── components/           # shadcn/ui components + Navbar
│   │   └── lib/                  # Clients, types, helpers
│   ├── middleware.ts             # Auth guard
│   └── vercel.json               # Install config
├── supabase/
│   └── migrations/               # Migrations SQL
├── .github/workflows/ci.yml     # CI pipeline
├── .husky/                       # Git hooks
└── README.md
```

---

## Rodar localmente

```bash
cd web
npm install
# Criar web/.env.local com:
#   NEXT_PUBLIC_SUPABASE_URL=<url>
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
npm run dev        # http://localhost:3000
npm run build      # Produção
npm run test       # Testes Vitest
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

---

## Credenciais padrão

| Papel | Usuário | Senha |
|-------|---------|-------|
| Admin de Segurança | admin | admin123 |
| Gerente | gerente | gerente123 |
| Funcionário | funcionario | funcionario123 |

> Login no formato `usuario@wayne.internal`

---

## Banco de Dados

- **profiles** — Perfis vinculados a `auth.users` via trigger
- **resources** — Recursos (equipamentos, veículos, dispositivos_seguranca)
- **access_logs** — Logs de acesso (append-only)
- **audit_logs** — Audit trail (append-only, trigger em resources)
- Enum `user_role`: `funcionario`, `gerente`, `admin_seguranca`
- RLS ativo em todas as tabelas com policies granulares por operação

---

## Contato

**Marcus Lafaiete** — [GitHub](https://github.com/marcuslaf) · [LinkedIn](https://www.linkedin.com/in/marcuslaf)

## Licença

MIT — Projeto educacional
