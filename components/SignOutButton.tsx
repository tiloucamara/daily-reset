'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { useState } from 'react'

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()
  const [isHovered, setIsHovered] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/auth')
  }

  return (
    <div className="relative">
      <button
        onClick={handleSignOut}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl 
                   bg-card hover:bg-accent text-foreground 
                   border border-border hover:border-primary/30
                   transition-all duration-200"
      >
        <LogOut className={`w-4 h-4 transition-transform duration-200 ${isHovered ? 'rotate-90' : ''}`} />
        <span className="text-sm font-medium">Déconnexion</span>
      </button>
      
      {/* Tooltip */}
      <div className={`
        absolute -top-10 left-1/2 transform -translate-x-1/2
        px-3 py-1.5 bg-foreground text-background text-xs rounded-lg
        transition-all duration-200 pointer-events-none
        ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}>
        Se déconnecter
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-foreground rotate-45" />
      </div>
    </div>
  )
}