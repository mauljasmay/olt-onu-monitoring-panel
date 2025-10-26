"use client"

import { SessionProvider } from "next-auth/react"

interface ProvidersProps {
  children: React.ReactNode
}

export function SessionProviderWrapper({ children }: ProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>
}