# Indústrias Wayne — Gestão de Recursos e Segurança

---

## 🇧🇷 Português Brasileiro

### Sobre o Projeto

Sistema full-stack para gerenciamento de recursos e controle de segurança da **Indústrias Wayne** (Universo Batman). Permite administrar equipamentos, veículos e dispositivos de segurança com controle de acesso baseado em papéis (RBAC).

### Funcionalidades

- **Autenticação** — Login com Supabase Auth (email+senha), sessão gerenciada via cookies
- **Dashboard** — Visão geral com estatísticas em tempo real, atividade recente e recursos em manutenção
- **Gestão de Recursos** — CRUD completo de equipamentos, veículos e dispositivos de segurança com busca e soft-delete
- **Admin de Usuários** — Criação e exclusão de usuários com atribuição de papéis (admin_seguranca, gerente, funcionario)
- **RBAC** — Controle de acesso por papel: funcionario (visualização), gerente (gerencia recursos), admin_seguranca (acesso total)
- **Interface Moderna** — Tema escuro, design responsivo com shadcn/ui e Tailwind CSS

### Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **UI** | shadcn/ui, Tailwind CSS, Lucide React |
| **Backend** | Supabase (PostgreSQL, Auth, RLS, Edge Functions) |
| **Auth** | Supabase Auth com @supabase/ssr |
| **Banco** | PostgreSQL (Supabase) com RLS policies |
| **Deploy** | Next.js → Vercel, Supabase (projeto jxdvpluzicymdkqwzzyy) |

### Estrutura do Projeto

```
industrias-wayne/
├── web/                          # Aplicação Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/            # Página de login
│   │   │   ├── dashboard/        # Dashboard principal
│   │   │   ├── resources/        # CRUD de recursos
│   │   │   ├── admin/users/      # Gestão de usuários
│   │   │   └── api/              # API routes (admin, seed)
│   │   ├── components/           # Componentes shadcn/ui
│   │   ├── lib/                  # Clientes Supabase, tipos
│   │   └── db/                   # Tipos do schema
│   ├── middleware.ts             # Auth guard (protege rotas)
│   └── .env.local                # Config Supabase
├── supabase/
│   └── migrations/               # Migrations SQL
└── README.md
```

### Como Rodar

```bash
# Pré-requisitos: Node.js 20+, npm/pnpm

# 1. Instalar dependências
cd web
npm install

# 2. Configurar variáveis de ambiente
# Crie web/.env.local com:
# NEXT_PUBLIC_SUPABASE_URL=<sua_url>
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua_chave_anon>

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build de produção
npm run build
```

### Credenciais Padrão

| Papel | Usuário | Senha |
|-------|---------|-------|
| Admin de Segurança | admin | admin123 |
| Gerente | gerente | gerente123 |
| Funcionário | funcionario | funcionario123 |

> Login usa formato `{usuario}@wayne.internal` (ex: `admin@wayne.internal`)

### Banco de Dados

Schema PostgreSQL com:
- `profiles` — Perfis de usuário (vinculados ao auth.users via trigger)
- `resources` — Recursos (equipamentos, veículos, dispositivos)
- `access_logs` — Logs de acesso (append-only)
- `user_role` enum: `funcionario`, `gerente`, `admin_seguranca`
- RLS ativo em todas as tabelas com policies granulares
- Trigger `on_auth_user_created` para criar profile automaticamente

### Licença

Projeto educacional — MIT

---

## 🇺🇸 English

### About the Project

Full-stack resource management and security control system for **Wayne Industries** (Batman Universe). Manage equipment, vehicles, and security devices with role-based access control (RBAC).

### Features

- **Authentication** — Supabase Auth (email+password), cookie-based sessions
- **Dashboard** — Real-time statistics overview, recent activity, maintenance items
- **Resource Management** — Full CRUD for equipment, vehicles, and security devices with search and soft-delete
- **User Admin** — Create and delete users with role assignment (admin_seguranca, gerente, funcionario)
- **RBAC** — Role-based access: funcionario (view-only), gerente (manage resources), admin_seguranca (full access)
- **Modern UI** — Dark theme, responsive design with shadcn/ui and Tailwind CSS

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **UI** | shadcn/ui, Tailwind CSS, Lucide React |
| **Backend** | Supabase (PostgreSQL, Auth, RLS, Edge Functions) |
| **Auth** | Supabase Auth with @supabase/ssr |
| **Database** | PostgreSQL (Supabase) with RLS policies |
| **Deploy** | Next.js → Vercel, Supabase (project jxdvpluzicymdkqwzzyy) |

### Project Structure

```
industrias-wayne/
├── web/                          # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/            # Login page
│   │   │   ├── dashboard/        # Main dashboard
│   │   │   ├── resources/        # Resource CRUD
│   │   │   ├── admin/users/      # User management
│   │   │   └── api/              # API routes (admin, seed)
│   │   ├── components/           # shadcn/ui components
│   │   ├── lib/                  # Supabase clients, types
│   │   └── db/                   # Schema types
│   ├── middleware.ts             # Auth guard (route protection)
│   └── .env.local                # Supabase config
├── supabase/
│   └── migrations/               # SQL migrations
└── README.md
```

### How to Run

```bash
# Prerequisites: Node.js 20+, npm/pnpm

# 1. Install dependencies
cd web
npm install

# 2. Configure environment
# Create web/.env.local with:
# NEXT_PUBLIC_SUPABASE_URL=<your_url>
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>

# 3. Run development server
npm run dev

# 4. Production build
npm run build
```

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Security Admin | admin | admin123 |
| Manager | gerente | gerente123 |
| Employee | funcionario | funcionario123 |

> Login uses `{username}@wayne.internal` format (e.g., `admin@wayne.internal`)

### Database

PostgreSQL schema with:
- `profiles` — User profiles (linked to auth.users via trigger)
- `resources` — Resources (equipment, vehicles, devices)
- `access_logs` — Access logs (append-only)
- `user_role` enum: `funcionario`, `gerente`, `admin_seguranca`
- RLS enabled on all tables with granular policies
- `on_auth_user_created` trigger to auto-create profiles

### License

Educational project — MIT
