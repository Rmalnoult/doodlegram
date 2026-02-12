import * as fal from '@fal-ai/client'

let configured = false

export function getFalClient() {
  if (!configured) {
    const config = useRuntimeConfig()
    fal.config({
      credentials: config.falKey
    })
    configured = true
  }
  return fal
}
