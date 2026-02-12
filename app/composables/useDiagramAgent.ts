import type { DiagramState, DiagramCategory, DiagramMode } from '~/types/diagram'

export const useDiagramAgent = () => {
  const state = useState<DiagramState>('diagram-state', () => ({
    prompt: '',
    category: 'general' as DiagramCategory,
    mode: 'agent' as DiagramMode,
    status: 'idle',
    elements: [],
    files: {},
    title: '',
    description: '',
    error: null,
    agentSteps: []
  }))

  let abortController: AbortController | null = null

  async function generate(prompt: string, category?: DiagramCategory) {
    // Reset state
    state.value.prompt = prompt
    if (category) state.value.category = category
    state.value.status = 'generating'
    state.value.error = null
    state.value.elements = []
    state.value.files = {}
    state.value.agentSteps = []
    state.value.title = ''
    state.value.description = ''

    abortController = new AbortController()

    try {
      const response = await fetch('/api/diagrams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, category }),
        signal: abortController.signal
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Parse SSE events from buffer
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          try {
            const event = JSON.parse(line.slice(6))

            switch (event.type) {
              case 'elements':
                // Add new elements to the canvas
                state.value.elements = [
                  ...state.value.elements,
                  ...event.data.elements
                ]
                // Merge files
                if (event.data.files) {
                  state.value.files = {
                    ...state.value.files,
                    ...event.data.files
                  }
                }
                state.value.status = 'generating'
                break

              case 'progress':
                state.value.agentSteps.push(event.data.message)
                break

              case 'done':
                state.value.title = event.data.title || 'Untitled Diagram'
                state.value.description = event.data.description || ''
                state.value.status = 'ready'
                break

              case 'error':
                state.value.error = event.data.message
                state.value.status = 'error'
                break
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // If we finished the stream without a 'done' event
      if (state.value.status === 'generating') {
        state.value.status = 'ready'
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return

      state.value.error = err instanceof Error ? err.message : 'Generation failed'
      state.value.status = 'error'
    }
  }

  function cancel() {
    abortController?.abort()
    state.value.status = 'idle'
  }

  function reset() {
    cancel()
    state.value.prompt = ''
    state.value.status = 'idle'
    state.value.elements = []
    state.value.files = {}
    state.value.title = ''
    state.value.description = ''
    state.value.error = null
    state.value.agentSteps = []
  }

  function loadDiagram(elements: unknown[], files: Record<string, unknown>, title: string, description: string) {
    state.value.elements = elements
    state.value.files = files
    state.value.title = title
    state.value.description = description
    state.value.status = 'ready'
  }

  return {
    state,
    generate,
    cancel,
    reset,
    loadDiagram
  }
}
