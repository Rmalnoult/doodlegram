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
    const client = useSupabaseClient()
    const user = useSupabaseUser()
    const { generateThumbnail } = useExcalidrawExport()

    let thumbnailUrl: string | null = null

    // Generate and upload thumbnail (non-blocking — failure won't prevent save)
    try {
      if (params.excalidrawJson.elements.length > 0 && user.value?.id) {
        const thumbnailBlob = await generateThumbnail(
          params.excalidrawJson.elements,
          params.excalidrawJson.files
        )

        const filename = `${user.value.id}/thumbnails/${Date.now()}.png`

        const { error: uploadError } = await client.storage
          .from('diagrams')
          .upload(filename, thumbnailBlob, {
            contentType: 'image/png',
            upsert: false
          })

        if (!uploadError) {
          const { data: urlData } = client.storage
            .from('diagrams')
            .getPublicUrl(filename)
          thumbnailUrl = urlData.publicUrl
        }
      }
    } catch (err) {
      console.warn('Thumbnail generation failed:', err)
    }

    const data = await $fetch('/api/diagrams/save', {
      method: 'POST',
      body: {
        title: params.title,
        description: params.description,
        category: params.category,
        prompt: params.prompt,
        mermaidSyntax: params.mermaidSyntax,
        excalidrawJson: params.excalidrawJson,
        thumbnailUrl
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
