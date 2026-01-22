'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle,
  GripVertical,
  Sun,
  Moon,
  Calendar,
  Home
} from 'lucide-react'
import { createClient } from '@/lib/supabase-client'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { SignOutButton } from './SignOutButton'

interface Task {
  id: string
  task_text: string
  is_completed: boolean
  task_order: number
}

function TaskItem({ task, onToggle, onDelete }: { 
  task: Task, 
  onToggle: (id: string) => void,
  onDelete: (id: string) => void 
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-all"
    >
      <button
        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-grab"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0"
      >
        {task.is_completed ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <Circle className="w-5 h-5 text-gray-400" />
        )}
      </button>

      <div className={`flex-1 ${task.is_completed ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}>
        {task.task_text}
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function TasksPage({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const router = useRouter()
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchTasks()
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('dark', savedTheme === 'dark')
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('daily_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('created_at', today)
        .order('task_order')

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async () => {
    if (!newTask.trim()) return

    try {
      const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.task_order)) : 0
      
      const { data, error } = await supabase
        .from('daily_tasks')
        .insert([{
          user_id: userId,
          task_text: newTask.trim(),
          task_order: maxOrder + 1,
          created_at: new Date().toISOString().split('T')[0]
        }])
        .select()

      if (error) throw error
      
      if (data) {
        setTasks([...tasks, data[0]])
        setNewTask('')
      }
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const toggleTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (!task) return

      const { error } = await supabase
        .from('daily_tasks')
        .update({ is_completed: !task.is_completed })
        .eq('id', taskId)

      if (error) throw error
      
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, is_completed: !t.is_completed } : t
      ))
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('daily_tasks')
        .delete()
        .eq('id', taskId)

      if (error) throw error
      
      setTasks(tasks.filter(t => t.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = tasks.findIndex(task => task.id === active.id)
      const newIndex = tasks.findIndex(task => task.id === over.id)
      const newTasks = arrayMove(tasks, oldIndex, newIndex)
      
      const updates = newTasks.map((task, index) => ({
        id: task.id,
        task_order: index
      }))

      try {
        for (const update of updates) {
          await supabase
            .from('daily_tasks')
            .update({ task_order: update.task_order })
            .eq('id', update.id)
        }
        
        setTasks(newTasks)
      } catch (error) {
        console.error('Error updating task order:', error)
      }
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  // Calculer la progression
  const completedTasks = tasks.filter(task => task.is_completed).length
  const totalTasks = tasks.length
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Déterminer la couleur
  let progressColor = 'bg-gray-300'
  let progressText = 'text-gray-500'
  
  if (totalTasks > 0) {
    if (percentage === 0) {
      progressColor = 'bg-red-900'
      progressText = 'text-red-900'
    } else if (percentage < 30) {
      progressColor = 'bg-red-500'
      progressText = 'text-red-500'
    } else if (percentage < 70) {
      progressColor = 'bg-yellow-500'
      progressText = 'text-yellow-500'
    } else {
      progressColor = 'bg-green-500'
      progressText = 'text-green-500'
    }
  }

  const today = new Date()
  const formattedDate = format(today, "EEEE d MMMM yyyy", { locale: fr })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header simple */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <Home className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Reset</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{formattedDate}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-gray-600" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-400" />
                )}
              </button>
              
              <Link
                href="/dashboard/calendar"
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </Link>
              
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Section */}
        <div className="mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-medium text-gray-900 dark:text-white mb-1">Progression du jour</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {completedTasks} sur {totalTasks} tâches complétées
                </p>
              </div>
              <div className={`text-xl font-bold ${progressText}`}>
                {percentage}%
              </div>
            </div>
            
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${progressColor} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Add Task */}
        <div className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Ajouter une nouvelle tâche..."
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addTask}
              disabled={!newTask.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
            >
              Ajouter
            </button>
          </div>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">Aucune tâche pour aujourd'hui</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Commence par ajouter ta première tâche</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map(task => task.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </main>
    </div>
  )
}