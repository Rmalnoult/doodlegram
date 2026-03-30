import OpenAI from 'openai'

let client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!client) {
    const config = useRuntimeConfig()
    client = new OpenAI({
      apiKey: config.openaiApiKey
    })
  }
  return client
}
