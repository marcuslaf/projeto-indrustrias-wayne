'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase-client'
import { Search, Activity, ChevronLeft, ChevronRight, ShieldAlert, Filter } from 'lucide-react'

const ITEMS_PER_PAGE = 15

export default function LogsPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState('funcionario')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserRole(user.user_metadata?.role ?? 'funcionario')
      const { data } = await supabase
        .from('access_logs')
        .select('*')
        .order('access_time', { ascending: false })
        .limit(100)
      if (data) setLogs(data as any[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = logs.filter((log) => {
    const matchSearch = !search || log.access_area.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || log.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paged = filtered.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  return (
    <div className="relative min-h-screen bg-zinc-950">
      <div className="absolute inset-0 bg-[url('/gotham-bg.jpg')] bg-cover bg-center opacity-[0.12] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/15 via-transparent to-transparent pointer-events-none" />
      <Navbar userRole={userRole} />
      <main className="relative mx-auto max-w-5xl px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-purple-500" />
            Logs de Acesso
          </h1>
          <p className="text-zinc-400 mt-1">Registro de todas as atividades e acessos ao sistema.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar por área..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-zinc-500" />
            <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(0) } }}>
              <SelectTrigger className="w-36 bg-zinc-900 border-zinc-800 text-zinc-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sucesso">Sucesso</SelectItem>
                <SelectItem value="falha">Falha</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card className="bg-zinc-900/10 border-zinc-700/30">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Registros ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-center text-zinc-500">Carregando...</div>
            ) : paged.length === 0 ? (
              <div className="p-6 text-center text-zinc-500">Nenhum registro encontrado.</div>
            ) : (
              <div className="divide-y divide-zinc-800">
                {paged.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-6 py-3 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${log.status === 'sucesso' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm text-zinc-300">{log.access_area}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(log.access_time).toLocaleString('pt-BR')}
                          {log.ip_address && ` • IP: ${log.ip_address}`}
                        </p>
                      </div>
                    </div>
                    <Badge variant={log.status === 'sucesso' ? 'default' : 'destructive'}>
                      {log.status === 'sucesso' ? 'Sucesso' : 'Falha'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="border-zinc-800 text-zinc-400"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-zinc-500">
              Página {page + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="border-zinc-800 text-zinc-400"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
