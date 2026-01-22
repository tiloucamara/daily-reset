import CalendarPage from '@/components/CalendarPage'
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function Calendar() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return <CalendarPage userId={session.user.id} />
}