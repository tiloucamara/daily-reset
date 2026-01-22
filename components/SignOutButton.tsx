'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    // Rafraîchir pour que le middleware redirige vers /auth
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Déconnexion
    </button>
  )
}