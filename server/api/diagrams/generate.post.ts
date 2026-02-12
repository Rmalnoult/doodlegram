import type Anthropic from '@anthropic-ai/sdk'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt, category } = body

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Prompt is required' })
  }

  if (prompt.length > 1000) {
    throw createError({ statusCode: 400, statusMessage: 'Prompt must be under 1000 characters' })
  }

  // Set up SSE
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })

  const client = getClaudeClient()
  resetElementCounter()

  const userMessage = category
    ? `Subject: ${category}. Create a diagram for: ${prompt}`
    : `Create a diagram for: ${prompt}`

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: 'user', content: userMessage }
  ]

  const allElements: unknown[] = []
  const allFiles: Record<string, unknown> = {}
  let diagramTitle = ''
  let diagramDescription = ''
  let iterations = 0
  const maxIterations = 25

  // Send SSE event helper
  function sendSSE(type: string, data: unknown) {
    const payload = JSON.stringify({ type, data })
    event.node.res.write(`data: ${payload}\n\n`)
  }

  sendSSE('progress', { message: 'Starting diagram generation...' })

  try {
    // Agent loop
    while (iterations < maxIterations) {
      iterations++

      const response = await client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        system: AGENT_SYSTEM_PROMPT,
        messages,
        tools: AGENT_TOOLS
      })

      // Check if the model wants to use tools
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.Messages.ToolUseBlock => block.type === 'tool_use'
      )

      if (toolUseBlocks.length === 0) {
        // Model is done (text response only)
        sendSSE('progress', { message: 'Finishing up...' })
        break
      }

      // Process each tool call
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []

      for (const toolUse of toolUseBlocks) {
        const toolInput = toolUse.input as Record<string, unknown>

        if (toolUse.name === 'finish_diagram') {
          diagramTitle = (toolInput.title as string) || 'Untitled Diagram'
          diagramDescription = (toolInput.description as string) || ''
          sendSSE('progress', { message: `Diagram complete: ${diagramTitle}` })
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: 'Diagram finished successfully.'
          })
          continue
        }

        sendSSE('progress', { message: `${toolUse.name.replace(/_/g, ' ')}...` })

        try {
          const result = await executeTool(toolUse.name, toolInput)

          // Collect elements and files
          if (result.elements.length > 0) {
            allElements.push(...result.elements)
            sendSSE('elements', {
              elements: result.elements,
              files: result.files || {}
            })
          }

          if (result.files) {
            Object.assign(allFiles, result.files)
          }

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `Success: ${result.description}. Element IDs: ${result.elements.map(e => e.id).join(', ')}`
          })
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Tool execution failed'
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `Error: ${errorMessage}`,
            is_error: true
          })
        }
      }

      // Add assistant response and tool results to conversation
      messages.push({ role: 'assistant', content: response.content })
      messages.push({ role: 'user', content: toolResults })

      // Stop if model signaled end_turn
      if (response.stop_reason === 'end_turn') {
        break
      }
    }

    // Send final event
    sendSSE('done', {
      title: diagramTitle,
      description: diagramDescription,
      elementCount: allElements.length,
      iterations
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Generation failed'
    sendSSE('error', { message: errorMessage })
  }

  event.node.res.end()
})
