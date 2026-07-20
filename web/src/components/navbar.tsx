'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, Package, Users } from 'lucide-react'
import { useEffect, useState } from 'react'

interface NavbarProps {
  userRole: string
}

function WayneSmallLogo() {
  return (
    <svg viewBox="0 0 120 120" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nav-logo-grad" x1="20" y1="20" x2="100" y2="100">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="108" height="108" rx="24" stroke="url(#nav-logo-grad)" strokeWidth="2.5" />
      <path
        d="M28 40 L40 85 L60 55 L80 85 L92 40"
        stroke="url(#nav-logo-grad)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Navbar({ userRole }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/resources', label: 'Recursos', icon: Package },
  ]

  if (userRole === 'admin_seguranca') {
    links.push({ href: '/admin/users', label: 'Usuários', icon: Users })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-700/30 bg-zinc-900/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <WayneSmallLogo />
            <span className="text-lg font-bold tracking-tight">
              <span className="bg-gradient-to-r from-purple-400 to-indigo-300 bg-clip-text text-transparent">
                Indústrias Wayne
              </span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-zinc-400 hover:text-zinc-100"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </header>
  )
}
