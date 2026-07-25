# Indústrias Wayne — Gestão de Recursos e Segurança | Wayne Industries — Resource & Security Management

## 🇧🇷 Português

Sistema full-stack para gerenciamento de recursos e controle de segurança da **Indústrias Wayne** (Universo Batman). Permite administrar equipamentos, veículos e dispositivos de segurança com controle de acesso baseado em papéis (RBAC). Construído com **Next.js 16 + Supabase**.

## 🇺🇸 English

Full-stack resource management and security control system for **Wayne Industries** (Batman Universe). Manage equipment, vehicles, and security devices with role-based access control (RBAC). Built with **Next.js 16 + Supabase**.

---

## ✨ Features | Funcionalidades

| Feature | Descrição | Description |
|---------|-----------|-------------|
| 🔐 **Autenticação** | Supabase Auth (email+senha), sessão via cookies | Supabase Auth (email+password), cookie sessions |
| 📊 **Dashboard** | Estatísticas em tempo real, atividade recente, manutenção | Real-time stats, recent activity, maintenance |
| 📦 **Gestão de Recursos** | CRUD completo com busca e soft-delete | Full CRUD with search and soft-delete |
| 👥 **Admin de Usuários** | Criação/exclusão com atribuição de papéis | Create/delete users with role assignment |
| 🛡️ **RBAC** | funcionario (view), gerente (manage), admin_seguranca (full) | Role-based access control |
| 🎨 **Interface Moderna** | Tema escuro, responsivo, shadcn/ui + Tailwind | Dark theme, responsive, shadcn/ui + Tailwind |

---

## 🛠️ Tech Stack | Pilha Tecnológica

| Camada / Layer | Tecnologia / Technology |
|----------------|------------------------|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **UI** | shadcn/ui, Tailwind CSS, Lucide React |
| **Backend** | Supabase (PostgreSQL, Auth, RLS, Edge Functions) |
| **Auth** | Supabase Auth com @supabase/ssr |
| **Database** | PostgreSQL (Supabase) com RLS policies |
| **Deploy** | Next.js → Vercel, Supabase (projeto jxdvpluzicymdkqwzzyy) |

---

## 📁 Project Structure | Estrutura do Projeto

`
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
`

---

## 🚀 How to Run | Como Rodar

`ash
# Prerequisites: Node.js 20+, npm/pnpm

# 1. Install dependencies
cd web
npm install

# 2. Configure environment
# Create web/.env.local with:
# NEXT_PUBLIC_SUPABASE_URL=<your_url>
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>

# 3. Development
npm run dev

# 4. Production build
npm run build
`

---

## 👤 Default Credentials | Credenciais Padrão

| Papel / Role | Usuário / Username | Senha / Password |
|--------------|--------------------|------------------|
| Admin de Segurança / Security Admin | admin | admin123 |
| Gerente / Manager | gerente | gerente123 |
| Funcionário / Employee | funcionario | funcionario123 |

> Login uses {username}@wayne.internal format (e.g., dmin@wayne.internal)

---

## 🗄️ Database | Banco de Dados

PostgreSQL schema with Supabase:

- **profiles** — Perfis de usuário (vinculados ao auth.users via trigger)
- **resources** — Recursos (equipamentos, veículos, dispositivos)
- **access_logs** — Logs de acesso (append-only)
- **user_role** enum: uncionario, gerente, dmin_seguranca
- RLS ativo em todas as tabelas com policies granulares
- Trigger on_auth_user_created para criar profile automaticamente

---

## 📬 Contact | Contato

**Marcus Lafaiete** — [GitHub](https://github.com/marcuslaf) · [LinkedIn](https://www.linkedin.com/in/marcuslaf)

## License

MIT — Projeto educacional / Educational project
