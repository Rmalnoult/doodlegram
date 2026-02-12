export const useDiagramQuick = () => {
  const { state, loadDiagram } = useDiagramAgent()

  async function generateQuick(prompt: string, category?: string) {
    state.value.prompt = prompt
    state.value.status = 'generating'
    state.value.error = null
    state.value.agentSteps = ['Generating Mermaid diagram...']

    try {
      const response = await $fetch('/api/diagrams/generate-quick', {
        method: 'POST',
        body: { prompt, category }
      })

      state.value.agentSteps.push('Converting to Excalidraw...')
      state.value.status = 'converting'

      // Dynamic import of mermaid-to-excalidraw (client-side only)
      const { parseMermaidToExcalidraw } = await import('@excalidraw/mermaid-to-excalidraw')
      const { convertToExcalidrawElements } = await import('@excalidraw/excalidraw')

      const { elements, files } = await parseMermaidToExcalidraw(
        response.mermaidSyntax,
        { fontSize: 16 }
      )

      const excalidrawElements = convertToExcalidrawElements(elements)

      loadDiagram(
        excalidrawElements,
        files || {},
        response.title,
        response.description
      )
    } catch (err) {
      state.value.error = err instanceof Error ? err.message : 'Quick generation failed'
      state.value.status = 'error'
    }
  }

  return {
    state,
    generateQuick
  }
}
