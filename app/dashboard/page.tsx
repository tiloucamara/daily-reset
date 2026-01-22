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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Daily Reset
              </h1>
              <span className="ml-4 text-gray-600 dark:text-gray-400">
                Bonjour, {profile?.username || session.user.email}
              </span>
            </div>
            
            <SignOutButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Ton espace personnel - La todo-list quotidienne arrive bientôt !
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Tâches aujourd'hui
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-gray-300 mb-2">
                  Pourcentage
                </h3>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">0%</p>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                  Progression
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  <span className="text-red-500">●</span>
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/dashboard/tasks"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Commencer avec tes tâches →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}