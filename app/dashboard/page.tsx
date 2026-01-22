import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SignOutButton } from '@/components/SignOutButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', session.user.id)
    .single()

  return (
    <div className="min-h-screen">
      <header className="bg-transparent py-6">
        <div className="app-container flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Daily Reset</h1>
            <div className="text-sm text-gray-600 dark:text-gray-400">Bonjour, {profile?.username || session.user.email}</div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/tasks" className="btn bg-blue-600 text-white hover:bg-blue-700">Tâches</Link>
            <Link href="/dashboard/calendar" className="btn bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Calendrier</Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="app-container py-8">
        <div className="card">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Ton espace personnel</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card p-6 bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Tâches aujourd'hui</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              </div>

              <div className="card p-6 bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Pourcentage</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">0%</p>
              </div>

              <div className="card p-6 bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Progression</h3>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">—</p>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/dashboard/tasks" className="btn bg-blue-600 text-white">Commencer →</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}