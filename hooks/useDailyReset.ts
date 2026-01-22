'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { startOfDay, isSameDay } from 'date-fns'

export function useDailyReset(userId: string) {
  const [lastResetDate, setLastResetDate] = useState<Date | null>(null)
  const [needsReset, setNeedsReset] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    checkAndReset()
    
    // Vérifie toutes les heures si une réinitialisation est nécessaire
    const interval = setInterval(checkAndReset, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [userId])

  const checkAndReset = async () => {
    const today = startOfDay(new Date())
    const savedDateStr = localStorage.getItem(`lastResetDate_${userId}`)
    const savedDate = savedDateStr ? new Date(savedDateStr) : null

    // Si c'est un nouveau jour et qu'on n'a pas encore réinitialisé
    if (!savedDate || !isSameDay(savedDate, today)) {
      setNeedsReset(true)
      await performReset()
      localStorage.setItem(`lastResetDate_${userId}`, today.toISOString())
      setLastResetDate(today)
      setNeedsReset(false)
    } else {
      setLastResetDate(savedDate)
      setNeedsReset(false)
    }
  }

  const performReset = async () => {
    try {
      // 1. Sauvegarde l'historique d'hier
      await saveYesterdayHistory()
      
      // 2. Supprime les tâches d'hier
      const today = new Date().toISOString().split('T')[0]
      await supabase
        .from('daily_tasks')
        .delete()
        .lt('created_at', today)
        .eq('user_id', userId)
      
      console.log('Daily reset performed successfully')
    } catch (error) {
      console.error('Error during daily reset:', error)
    }
  }

  const saveYesterdayHistory = async () => {
    try {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // Récupère les tâches d'hier
      const { data: yesterdayTasks, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('created_at', yesterdayStr)

      if (error) throw error

      if (yesterdayTasks && yesterdayTasks.length > 0) {
        const totalTasks = yesterdayTasks.length
        const completedTasks = yesterdayTasks.filter(task => task.is_completed).length
        const completionPercentage = Math.round((completedTasks / totalTasks) * 100)

        // Détermine la couleur
        let color = 'gray'
        if (totalTasks === 0) {
          color = 'gray'
        } else if (completionPercentage === 0) {
          color = 'red-900'
        } else if (completionPercentage < 30) {
          color = 'red-500'
        } else if (completionPercentage < 70) {
          color = 'yellow-500'
        } else {
          color = 'green-500'
        }

        // Sauvegarde dans l'historique
        await supabase
          .from('completion_history')
          .upsert({
            user_id: userId,
            date: yesterdayStr,
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
            completion_percentage: completionPercentage,
            color: color
          })
      }
    } catch (error) {
      console.error('Error saving daily history:', error)
    }
  }

  return { needsReset, lastResetDate }
}