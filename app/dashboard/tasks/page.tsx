import TasksPage from '@/components/TasksPage'
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export default async function Tasks() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  return <TasksPage userId={session.user.id} />
}