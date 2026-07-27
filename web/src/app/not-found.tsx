import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-zinc-800/50 p-4">
        <div className="text-4xl">🔍</div>
      </div>
      <h1 className="text-xl font-bold text-zinc-100">Página não encontrada</h1>
      <p className="max-w-md text-sm text-zinc-400">A página que você procura não existe ou foi movida.</p>
      <Link
        href="/dashboard"
        className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-700 bg-transparent px-4 text-sm text-zinc-300 hover:bg-zinc-800"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  )
}
