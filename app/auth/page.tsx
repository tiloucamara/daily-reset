import Auth from '@/components/Auth'
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function AuthPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Si l'utilisateur est déjà connecté, redirige vers le dashboard
  if (session) {
    redirect('/dashboard')
  }

  return <Auth />
}