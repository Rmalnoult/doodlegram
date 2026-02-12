export type DiagramCategory =
  | 'science'
  | 'math'
  | 'history'
  | 'language'
  | 'geography'
  | 'biology'
  | 'physics'
  | 'chemistry'
  | 'general'

export type DiagramMode = 'agent' | 'quick'

export type DiagramStatus =
  | 'idle'
  | 'generating'
  | 'converting'
  | 'ready'
  | 'error'

export interface DiagramState {
  prompt: string
  category: DiagramCategory
  mode: DiagramMode
  status: DiagramStatus
  elements: unknown[]
  files: Record<string, unknown>
  title: string
  description: string
  error: string | null
  agentSteps: string[]
}

export interface SavedDiagram {
  id: string
  user_id: string
  title: string
  description: string | null
  category: string
  prompt: string
  mermaid_syntax: string | null
  excalidraw_json: {
    elements: unknown[]
    files: Record<string, unknown>
  }
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export const CATEGORIES: { value: DiagramCategory; label: string; icon: string }[] = [
  { value: 'general', label: 'General', icon: 'i-lucide-shapes' },
  { value: 'science', label: 'Science', icon: 'i-lucide-flask-conical' },
  { value: 'biology', label: 'Biology', icon: 'i-lucide-leaf' },
  { value: 'physics', label: 'Physics', icon: 'i-lucide-atom' },
  { value: 'chemistry', label: 'Chemistry', icon: 'i-lucide-test-tube-diagonal' },
  { value: 'math', label: 'Math', icon: 'i-lucide-calculator' },
  { value: 'history', label: 'History', icon: 'i-lucide-landmark' },
  { value: 'geography', label: 'Geography', icon: 'i-lucide-globe-2' },
  { value: 'language', label: 'Language', icon: 'i-lucide-book-open' }
]

export const SUGGESTIONS = [
  'The Water Cycle',
  'Photosynthesis',
  'Solar System',
  'Food Chain',
  'Cell Division',
  'Branches of Government',
  'States of Matter',
  'Scientific Method',
  'Parts of a Plant',
  'The Digestive System'
]
