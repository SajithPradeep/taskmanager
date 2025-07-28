import { createClient } from '@supabase/supabase-js'

// Try both ways of accessing environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

console.log('Environment Check:')
console.log('import.meta.env:', {
  url: !!import.meta.env.VITE_SUPABASE_URL,
  key: !!import.meta.env.VITE_SUPABASE_ANON_KEY
})
console.log('process.env:', {
  url: !!process.env.VITE_SUPABASE_URL,
  key: !!process.env.VITE_SUPABASE_ANON_KEY
})

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type TaskSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'WEEK' | 'MONTH' | 'YEAR'
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskCategory = 'personal' | 'office' | 'career' | 'family'
export type TaskStatus = 'not_started' | 'in_progress' | 'completed'

export interface Task {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  size?: TaskSize;
  category?: TaskCategory;
  expected_completion_date?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  priority?: TaskPriority[];
  size?: TaskSize[];
  category?: TaskCategory[];
  timeFrame?: ('today' | 'week' | 'month')[];
}

export const taskSizeDescriptions: Record<TaskSize, string> = {
  'XS': '< 10 mins',
  'S': '< 1 hour',
  'M': '1-2 hours',
  'L': '1 day',
  'XL': 'Few days',
  'WEEK': '1 week',
  'MONTH': '1 month',
  'YEAR': '1 year'
};

export const taskStatusColors: Record<TaskStatus, string> = {
  'not_started': '#ff9800',
  'in_progress': '#2196f3',
  'completed': '#4caf50'
};

export type TaskAction = 'created' | 'status_changed' | 'field_updated' | 'comment_added';

export interface TaskHistory {
  id: number;
  task_id: number;
  action: TaskAction;
  previous_status?: TaskStatus;
  new_status?: TaskStatus;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  changed_at: string;
  changed_by: string;
} 