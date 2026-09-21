# Industrias Wayne - Gestao de Recursos e Seguranca / Wayne Industries - Resource and Security Management

Sistema full-stack de gestao empresarial da **Industrias Wayne** (Universo Batman). Gerencia equipamentos, veiculos e dispositivos de seguranca com RBAC, dashboard interativo e audit trail. Construido com **Next.js 16 + Supabase**.

Full-stack enterprise management system for **Wayne Industries** (Batman Universe). Manages equipment, vehicles, and security devices with RBAC, interactive dashboard, and audit trail. Built with **Next.js 16 + Supabase**.

**Deploy:** https://web-green-eta-ooechjq01q.vercel.app

---

## Funcionalidades / Features

| Funcionalidade / Feature | Descricao / Description |
|--------------------------|------------------------|
| **Dashboard** | Cards com estatisticas, graficos Recharts (pizza/barras), filtro por periodo, 3 abas / Stats cards, Recharts charts (pie/bar), period filter, 3 tabs |
| **Gestao de Recursos / Resource Management** | CRUD completo com validacao Zod, soft-delete, busca, detalhes com edicao inline / Full CRUD with Zod validation, soft-delete, search, inline edit details |
| **Perfil / Profile** | Edicao de nome e alteracao de senha / Name edit and password change |
| **Logs de Atividade / Activity Logs** | Access logs paginados com busca e filtro / Paginated access logs with search and filter |
| **Admin de Usuarios / User Admin** | Criacao/exclusao com atribuicao de papeis (admin_seguranca) / Create/delete with role assignment (admin_seguranca) |
| **RBAC** | funcionario (view), gerente (manage), admin_seguranca (full) |
| **Audit Trail** | Tabela audit_logs com trigger automatico em resources / audit_logs table with automatic trigger on resources |
| **Mobile** | Navbar responsiva com menu hamburger (Sheet shadcn/ui) / Responsive navbar with hamburger menu |

---

## Stack Tecnologica / Tech Stack

| Camada / Layer | Tecnologia / Technology |
|----------------|------------------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| **UI** | shadcn/ui, Lucide React, Recharts |
| **Backend** | Supabase (PostgreSQL, Auth, RLS) |
| **Auth** | Supabase Auth + @supabase/ssr |
| **Database** | PostgreSQL, RLS policies, triggers, enum types |
| **Testes / Tests** | Vitest + Testing Library |
| **CI/CD** | GitHub Actions, Husky, lint-staged, commitlint |
| **Deploy** | Vercel (projeto industrias-wayne), Supabase |

---

## Estrutura / Structure

```
industrias-wayne/
  web/                          # Next.js app
    src/
      app/
        login/                  # Login
        dashboard/              # Dashboard interativo / Interactive dashboard
        resources/              # CRUD + [id] detalhes / details
        profile/                # Editar perfil/senha / Edit profile/password
        logs/                   # Access logs
        admin/users/            # Admin de usuarios / User admin
        api/seed/               # Seed de dados / Data seed
        api/admin/users/        # Admin API
      components/               # shadcn/ui components + Navbar
      lib/                      # Clients, types, helpers
    middleware.ts               # Auth guard
  supabase/
    migrations/                 # Migrations SQL
  .github/workflows/ci.yml     # CI pipeline
  .husky/                       # Git hooks
  README.md
```

---

## Rodar Localmente / Run Locally

```bash
cd web
npm install
# Criar web/.env.local com / Create with:
#   NEXT_PUBLIC_SUPABASE_URL=<url>
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
npm run dev        # http://localhost:3000
npm run build      # Producao / Production
npm run test       # Testes Vitest / Vitest tests
npm run lint       # ESLint
npm run typecheck  # TypeScript
```

---

## Credenciais Padrao / Default Credentials

| Papel / Role | Usuario / Username | Senha / Password |
|--------------|-------------------|-------------------|
| Admin de Seguranca / Security Admin | admin | admin123 |
| Gerente / Manager | gerente | gerente123 |
| Funcionario / Employee | funcionario | funcionario123 |

> Login no formato usuario@wayne.internal / Login format: usuario@wayne.internal

---

## Banco de Dados / Database

- **profiles** - Perfis vinculados a auth.users via trigger / Profiles linked to auth.users via trigger
- **resources** - Recursos (equipamentos, veiculos, dispositivos_seguranca) / Resources (equipment, vehicles, security_devices)
- **access_logs** - Logs de acesso (append-only) / Access logs (append-only)
- **audit_logs** - Audit trail (append-only, trigger em resources)
- Enum user_role: funcionario, gerente, admin_seguranca
- RLS ativo em todas as tabelas com policies granulares por operacao / RLS active on all tables with granular policies per operation

---

## Contato / Contact

**Marcus Lafaiete** - [GitHub](https://github.com/marcuslaf) | [LinkedIn](https://www.linkedin.com/in/marcuslaf)

## Licenca / License

MIT - Projeto educacional / Educational project
