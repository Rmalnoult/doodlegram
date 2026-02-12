import Anthropic from '@anthropic-ai/sdk'

let client: Anthropic | null = null

export function getClaudeClient(): Anthropic {
  if (!client) {
    const config = useRuntimeConfig()
    client = new Anthropic({
      apiKey: config.anthropicApiKey
    })
  }
  return client
}
