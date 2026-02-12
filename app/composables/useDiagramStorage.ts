import type { SavedDiagram } from '~/types/diagram'

export const useDiagramStorage = () => {
  const diagrams = useState<SavedDiagram[]>('saved-diagrams', () => [])
  const loading = useState('diagrams-loading', () => false)

  async function fetchDiagrams() {
    const client = useSupabaseClient()
    const user = useSupabaseUser()

    if (!user.value?.id) return

    loading.value = true
    const { data, error } = await client
      .from('diagrams')
      .select()
      .eq('user_id', user.value.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      diagrams.value = data as SavedDiagram[]
    }
    loading.value = false
  }

  async function saveDiagram(params: {
    title: string
    description?: string
    category?: string
    prompt: string
    mermaidSyntax?: string
    excalidrawJson: { elements: unknown[]; files: Record<string, unknown> }
  }) {
    const data = await $fetch('/api/diagrams/save', {
      method: 'POST',
      body: {
        title: params.title,
        description: params.description,
        category: params.category,
        prompt: params.prompt,
        mermaidSyntax: params.mermaidSyntax,
        excalidrawJson: params.excalidrawJson
      }
    })

    // Add to local list
    diagrams.value.unshift(data as SavedDiagram)
    return data
  }

  async function deleteDiagram(id: string) {
    await $fetch(`/api/diagrams/${id}`, { method: 'DELETE' })
    diagrams.value = diagrams.value.filter(d => d.id !== id)
  }

  async function loadDiagram(id: string) {
    const data = await $fetch(`/api/diagrams/${id}`)
    return data as SavedDiagram
  }

  return {
    diagrams,
    loading,
    fetchDiagrams,
    saveDiagram,
    deleteDiagram,
    loadDiagram
  }
}
