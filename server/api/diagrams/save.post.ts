import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const client = await serverSupabaseClient(event)
  const body = await readBody(event)

  const { title, description, category, prompt, mermaidSyntax, excalidrawJson, thumbnailUrl } = body

  if (!title || !prompt || !excalidrawJson) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const { data, error } = await client
    .from('diagrams')
    .insert({
      user_id: user.id,
      title,
      description: description || null,
      category: category || 'general',
      prompt,
      mermaid_syntax: mermaidSyntax || null,
      excalidraw_json: excalidrawJson,
      thumbnail_url: thumbnailUrl || null
    })
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return data
})
