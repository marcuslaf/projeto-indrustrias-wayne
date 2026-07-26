"use client"

import { useState, useCallback, useRef } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { TriangleAlertIcon } from "lucide-react"

type ConfirmOptions = {
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "destructive" | "default"
}

export function useConfirmDialog() {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    description: "",
  })
  const resolveRef = useRef<((v: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setOpen(true)
    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleConfirm = useCallback(() => {
    setOpen(false)
    resolveRef.current?.(true)
  }, [])

  const handleCancel = useCallback(() => {
    setOpen(false)
    resolveRef.current?.(false)
  }, [])

  const dialog = (
    <AlertDialog open={open} onOpenChange={(v) => {
      setOpen(v)
      if (!v) resolveRef.current?.(false)
    }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlertIcon className="text-destructive" />
          </AlertDialogMedia>
          <AlertDialogTitle>{options.title}</AlertDialogTitle>
          <AlertDialogDescription>{options.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            {options.cancelLabel ?? "Cancelar"}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={options.variant ?? "destructive"}
            onClick={handleConfirm}
          >
            {options.confirmLabel ?? "Confirmar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { confirm, dialog }
}
