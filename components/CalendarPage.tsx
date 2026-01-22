'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-client'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameMonth,
  isToday,
  subMonths,
  addMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Home, Calendar as CalendarIcon } from 'lucide-react'
import { SignOutButton } from './SignOutButton'

interface DayData {
  date: string
  total_tasks: number
  completed_tasks: number
  completion_percentage: number
  color: string
}

export default function CalendarPage({ userId }: { userId: string }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [daysData, setDaysData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchMonthData = async (month: Date) => {
    setLoading(true)
    try {
      const start = startOfMonth(month)
      const end = endOfMonth(month)
      
      const { data, error } = await supabase
        .from('completion_history')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])

      if (error) throw error
      
      setDaysData(data || [])
    } catch (error) {
      console.error('Error fetching calendar data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMonthData(currentMonth)
  }, [currentMonth, userId])

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const getDayData = (date: Date): DayData | undefined => {
    const dateStr = date.toISOString().split('T')[0]
    return daysData.find(day => day.date === dateStr)
  }

  const getColorClass = (color: string) => {
    switch(color) {
      case 'gray': return 'bg-gray-200 dark:bg-gray-700'
      case 'red-900': return 'bg-red-900'
      case 'red-500': return 'bg-red-500'
      case 'yellow-500': return 'bg-yellow-500'
      case 'green-500': return 'bg-green-500'
      default: return 'bg-gray-200 dark:bg-gray-700'
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Lundi
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Calcule les statistiques du mois
  const monthStats = daysData.reduce(
    (acc, day) => {
      acc.totalDaysWithTasks++
      acc.totalTasks += day.total_tasks
      acc.completedTasks += day.completed_tasks
      return acc
    },
    { totalDaysWithTasks: 0, totalTasks: 0, completedTasks: 0 }
  )

  const overallPercentage = monthStats.totalTasks > 0 
    ? Math.round((monthStats.completedTasks / monthStats.totalTasks) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Home className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Daily Reset - Calendrier
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/tasks"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CalendarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Month Navigation and Stats */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Month Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                Jours avec tâches
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {monthStats.totalDaysWithTasks}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold text-gray-900 dark:text-gray-300 mb-2">
                Tâches totales
              </h3>
              <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                {monthStats.totalTasks}
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                Taux de complétion
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {overallPercentage}%
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Aucune tâche</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-900" />
              <span className="text-sm text-gray-600 dark:text-gray-400">0% complété</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">0-30%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">30-70%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">70-100%</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du calendrier...</p>
            </div>
          ) : (
            <>
              {/* Day names */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                  <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const dayData = getDayData(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isTodayDate = isToday(day)
                  
                  return (
                    <div
                      key={day.toString()}
                      className={`
                        aspect-square rounded-lg p-2 flex flex-col items-center justify-center
                        ${!isCurrentMonth ? 'opacity-30' : ''}
                        ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                        ${dayData ? getColorClass(dayData.color) : 'bg-gray-50 dark:bg-gray-900/50'}
                        hover:shadow-md transition-shadow
                      `}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      
                      {dayData && dayData.total_tasks > 0 && (
                        <>
                          <div className="text-xs mb-1">
                            {dayData.completed_tasks}/{dayData.total_tasks}
                          </div>
                          <div className="text-xs font-bold">
                            {dayData.completion_percentage}%
                          </div>
                        </>
                      )}
                      
                      {dayData && dayData.total_tasks === 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          -
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Comment lire le calendrier ?
          </h3>
          <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
            <li>• Chaque carré représente un jour du mois</li>
            <li>• Les couleurs montrent ton niveau de productivité</li>
            <li>• Vert foncé = Excellente journée (70-100% des tâches faites)</li>
            <li>• Vert clair = Bonne journée (30-70%)</li>
            <li>• Orange = À améliorer (0-30%)</li>
            <li>• Rouge = Aucune tâche complétée</li>
            <li>• Gris = Aucune tâche définie ce jour</li>
          </ul>
        </div>
      </main>
    </div>
  )
}