export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { prompt } = body

  if (!prompt || typeof prompt !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Prompt is required' })
  }

  try {
    const falClient = getFalClient()

    const result = await falClient.subscribe('fal-ai/recraft/v3/text-to-image', {
      input: {
        prompt: `simple hand-drawn educational illustration, digital illustration style, ${prompt}`,
        image_size: 'square',
        num_images: 1,
        style: 'digital_illustration'
      }
    }) as { data: { images: { url: string }[] } }

    const imageUrl = result.data?.images?.[0]?.url
    if (!imageUrl) {
      throw new Error('No image generated')
    }

    return { url: imageUrl }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image generation failed'
    throw createError({ statusCode: 500, statusMessage: message })
  }
})
