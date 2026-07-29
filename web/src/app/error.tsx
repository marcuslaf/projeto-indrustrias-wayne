'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="rounded-full bg-red-500/10 p-4">
        <div className="text-4xl text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
      </div>
      <h1 className="text-xl font-bold text-zinc-100">Algo deu errado</h1>
      <p className="max-w-md text-sm text-zinc-400">{error.message || 'Ocorreu um erro inesperado.'}</p>
      <Button onClick={reset} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
        Tentar novamente
      </Button>
    </div>
  )
}
