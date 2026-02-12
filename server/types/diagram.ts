export interface ExcalidrawElement {
  id: string
  type: 'rectangle' | 'ellipse' | 'diamond' | 'text' | 'arrow' | 'line' | 'image'
  x: number
  y: number
  width: number
  height: number
  angle: number
  strokeColor: string
  backgroundColor: string
  fillStyle: 'solid' | 'hachure' | 'cross-hatch'
  strokeWidth: number
  strokeStyle: 'solid' | 'dashed' | 'dotted'
  roughness: number
  opacity: number
  roundness: { type: number; value?: number } | null
  seed: number
  version: number
  versionNonce: number
  isDeleted: boolean
  groupIds: string[]
  boundElements: { id: string; type: string }[] | null
  updated: number
  link: string | null
  locked: boolean
  [key: string]: unknown
}

export interface AgentToolResult {
  elements: ExcalidrawElement[]
  files?: Record<string, { mimeType: string; id: string; dataURL: string }>
  description: string
}

export interface DiagramGenerateRequest {
  prompt: string
  category?: string
  mode?: 'agent' | 'quick'
}

export interface SSEEvent {
  type: 'elements' | 'progress' | 'done' | 'error'
  data: unknown
}
