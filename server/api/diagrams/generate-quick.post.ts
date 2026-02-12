export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt, category } = body

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Prompt is required' })
  }

  const client = getClaudeClient()

  const userMessage = category
    ? `Subject: ${category}. Create a diagram for: ${prompt}`
    : `Create a diagram for: ${prompt}`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    system: QUICK_MODE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
    tools: [QUICK_MODE_TOOL],
    tool_choice: { type: 'tool', name: 'generate_diagram' }
  })

  const toolUse = response.content.find(block => block.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw createError({ statusCode: 500, statusMessage: 'Failed to generate diagram' })
  }

  const result = toolUse.input as {
    title: string
    description: string
    diagram_type: string
    mermaid_syntax: string
  }

  return {
    title: result.title,
    description: result.description,
    diagramType: result.diagram_type,
    mermaidSyntax: result.mermaid_syntax
  }
})
