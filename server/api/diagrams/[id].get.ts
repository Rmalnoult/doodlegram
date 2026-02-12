import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Diagram ID is required' })
  }

  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('diagrams')
    .select()
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, statusMessage: 'Diagram not found' })
  }

  return data
})
