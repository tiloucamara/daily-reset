'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, subMonths, addMonths, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

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

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        const { data, error } = await supabase
          .from('completion_history')
          .select('*')
          .eq('user_id', userId)
          .gte('date', start.toISOString().split('T')[0])
          .lte('date', end.toISOString().split('T')[0])
        if (error) throw error
        setDaysData(data || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [currentMonth, userId])

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const monthStats = daysData.reduce((acc, day) => {
    acc.totalDaysWithTasks++
    acc.totalTasks += day.total_tasks
    acc.completedTasks += day.completed_tasks
    return acc
  }, { totalDaysWithTasks: 0, totalTasks: 0, completedTasks: 0 } as { totalDaysWithTasks: number; totalTasks: number; completedTasks: number })

  const overallPercentage = monthStats.totalTasks > 0 ? Math.round((monthStats.completedTasks / monthStats.totalTasks) * 100) : 0

  const getDayData = (date: Date) => daysData.find(d => d.date === date.toISOString().split('T')[0])

  return (
    <div className="min-h-screen">
      <main className="app-container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Daily Reset - Calendrier</h1>
          <div className="flex items-center gap-2">
            <button onClick={goToPreviousMonth} className="btn">←</button>
            <div className="font-medium">{format(currentMonth, 'MMMM yyyy', { locale: fr })}</div>
            <button onClick={goToNextMonth} className="btn">→</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <div className="text-sm text-gray-600">Jours avec tâches</div>
            <div className="text-2xl font-bold">{monthStats.totalDaysWithTasks}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Tâches totales</div>
            <div className="text-2xl font-bold">{monthStats.totalTasks}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Taux de complétion</div>
            <div className="text-2xl font-bold">{overallPercentage}%</div>
          </div>
        </div>

        <div className="card">
          {loading ? (
            <div className="text-center py-8">Chargement...</div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-2 mb-4 text-center text-sm font-medium text-gray-500">
                {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => <div key={d}>{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map(day => {
                  const dayData = getDayData(day)
                  const isCurrentMonth = isSameMonth(day, currentMonth)
                  const isTodayDate = isToday(day)
                  return (
                    <div key={day.toString()} className={`aspect-square rounded-md p-2 flex flex-col items-center justify-center ${!isCurrentMonth ? 'opacity-40' : ''} ${isTodayDate ? 'ring-2 ring-blue-500' : ''}`}>
                      <div className="text-sm font-medium mb-1">{format(day,'d')}</div>
                      {dayData && dayData.total_tasks > 0 ? (
                        <div className="text-xs">{dayData.completed_tasks}/{dayData.total_tasks} • {dayData.completion_percentage}%</div>
                      ) : (
                        <div className="text-xs text-gray-400">—</div>
                      )}
                    </div>
                  )})}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )

}