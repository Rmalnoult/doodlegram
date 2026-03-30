import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const adminClient = serverSupabaseServiceRole(event)

  // Clean up user's storage files before deleting the user
  try {
    const { data: files } = await adminClient.storage
      .from('diagrams')
      .list(user.id)

    if (files && files.length > 0) {
      const filePaths = files.map((f: { name: string }) => `${user.id}/${f.name}`)
      await adminClient.storage.from('diagrams').remove(filePaths)
    }

    // Also clean thumbnails subfolder
    const { data: thumbFiles } = await adminClient.storage
      .from('diagrams')
      .list(`${user.id}/thumbnails`)

    if (thumbFiles && thumbFiles.length > 0) {
      const thumbPaths = thumbFiles.map((f: { name: string }) => `${user.id}/thumbnails/${f.name}`)
      await adminClient.storage.from('diagrams').remove(thumbPaths)
    }
  } catch {
    // Storage cleanup is best-effort
  }

  // Delete the user (cascades to diagrams table via ON DELETE CASCADE)
  const { error } = await adminClient.auth.admin.deleteUser(user.id)

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete account'
    })
  }

  return { success: true }
})
