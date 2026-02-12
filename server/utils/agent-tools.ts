import type { ExcalidrawElement, AgentToolResult } from '../types/diagram'
import type Anthropic from '@anthropic-ai/sdk'

let elementCounter = 0

function nextId(): string {
  return `el_${++elementCounter}`
}

function randomSeed(): number {
  return Math.floor(Math.random() * 2147483647)
}

export function resetElementCounter() {
  elementCounter = 0
}

function baseElement(overrides: Partial<ExcalidrawElement>): ExcalidrawElement {
  const id = overrides.id || nextId()
  return {
    id,
    type: 'rectangle',
    x: 0,
    y: 0,
    width: 100,
    height: 50,
    angle: 0,
    strokeColor: '#1e1e1e',
    backgroundColor: 'transparent',
    fillStyle: 'solid',
    strokeWidth: 2,
    strokeStyle: 'solid',
    roughness: 1,
    opacity: 100,
    roundness: { type: 3 },
    seed: randomSeed(),
    version: 1,
    versionNonce: randomSeed(),
    isDeleted: false,
    groupIds: [],
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false,
    ...overrides
  }
}

function createTextElement(
  x: number,
  y: number,
  text: string,
  fontSize: number = 20,
  color: string = '#1e1e1e',
  textAlign: string = 'center'
): ExcalidrawElement {
  const charWidth = fontSize * 0.6
  const width = text.length * charWidth
  const height = fontSize * 1.4

  return baseElement({
    type: 'text',
    x: x - width / 2,
    y: y - height / 2,
    width,
    height,
    strokeColor: color,
    backgroundColor: 'transparent',
    text,
    fontSize,
    fontFamily: 1,
    textAlign,
    verticalAlign: 'middle',
    containerId: null,
    originalText: text,
    autoResize: true,
    lineHeight: 1.25
  } as Partial<ExcalidrawElement>)
}

// Tool definitions for Claude
export const AGENT_TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: 'create_shape',
    description: 'Create a shape on the Excalidraw canvas. Use for boxes, circles, diamonds in diagrams.',
    input_schema: {
      type: 'object' as const,
      properties: {
        shape_type: {
          type: 'string',
          enum: ['rectangle', 'ellipse', 'diamond'],
          description: 'The shape type'
        },
        x: { type: 'number', description: 'X position (pixels from left)' },
        y: { type: 'number', description: 'Y position (pixels from top)' },
        width: { type: 'number', description: 'Width in pixels' },
        height: { type: 'number', description: 'Height in pixels' },
        label: { type: 'string', description: 'Text label inside the shape' },
        fill_color: {
          type: 'string',
          description: 'Background color (hex, e.g. #a8d8ea for light blue, #ffd6a5 for light orange, #caffbf for light green, #fdffb6 for light yellow, #bdb2ff for light purple, #ffc6ff for light pink)'
        },
        stroke_color: { type: 'string', description: 'Border color (hex). Default: #1e1e1e' }
      },
      required: ['shape_type', 'x', 'y', 'width', 'height', 'label']
    }
  },
  {
    name: 'create_text',
    description: 'Create a standalone text element on the canvas. Use for titles, labels, annotations.',
    input_schema: {
      type: 'object' as const,
      properties: {
        x: { type: 'number', description: 'X position (center)' },
        y: { type: 'number', description: 'Y position (center)' },
        text: { type: 'string', description: 'The text content' },
        font_size: { type: 'number', description: 'Font size in pixels (default 20, use 28-36 for titles)' },
        color: { type: 'string', description: 'Text color (hex). Default: #1e1e1e' }
      },
      required: ['x', 'y', 'text']
    }
  },
  {
    name: 'create_arrow',
    description: 'Create an arrow connecting two points or shapes. Use for relationships, flows, processes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        start_x: { type: 'number', description: 'Start X position' },
        start_y: { type: 'number', description: 'Start Y position' },
        end_x: { type: 'number', description: 'End X position' },
        end_y: { type: 'number', description: 'End Y position' },
        label: { type: 'string', description: 'Optional label on the arrow' },
        stroke_color: { type: 'string', description: 'Arrow color (hex). Default: #1e1e1e' }
      },
      required: ['start_x', 'start_y', 'end_x', 'end_y']
    }
  },
  {
    name: 'generate_illustration',
    description: 'Generate an AI illustration and place it on the canvas. Use for visual enrichment of educational diagrams.',
    input_schema: {
      type: 'object' as const,
      properties: {
        prompt: { type: 'string', description: 'Description of the illustration (e.g. "simple watercolor cloud with rain drops")' },
        x: { type: 'number', description: 'X position on canvas' },
        y: { type: 'number', description: 'Y position on canvas' },
        width: { type: 'number', description: 'Display width (default 150)' },
        height: { type: 'number', description: 'Display height (default 150)' }
      },
      required: ['prompt', 'x', 'y']
    }
  },
  {
    name: 'finish_diagram',
    description: 'Call this when you are done building the diagram. Provide a title and short description.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'A short title for the diagram' },
        description: { type: 'string', description: 'A one-sentence description of what the diagram shows' }
      },
      required: ['title', 'description']
    }
  }
]

// Execute a tool call and return Excalidraw elements
export function executeCreateShape(input: {
  shape_type: string
  x: number
  y: number
  width: number
  height: number
  label: string
  fill_color?: string
  stroke_color?: string
}): AgentToolResult {
  const shapeId = nextId()
  const elements: ExcalidrawElement[] = []

  // Create the shape
  const shape = baseElement({
    id: shapeId,
    type: input.shape_type as ExcalidrawElement['type'],
    x: input.x,
    y: input.y,
    width: input.width,
    height: input.height,
    backgroundColor: input.fill_color || 'transparent',
    strokeColor: input.stroke_color || '#1e1e1e',
    fillStyle: input.fill_color ? 'solid' : 'hachure'
  })

  elements.push(shape)

  // Create the label text inside the shape
  if (input.label) {
    const textEl = createTextElement(
      input.x + input.width / 2,
      input.y + input.height / 2,
      input.label,
      16,
      input.stroke_color || '#1e1e1e'
    )
    textEl.containerId = shapeId as unknown as string

    // Link text to shape
    shape.boundElements = [{ id: textEl.id, type: 'text' }]

    elements.push(textEl)
  }

  return {
    elements,
    description: `Created ${input.shape_type} "${input.label}" at (${input.x}, ${input.y})`
  }
}

export function executeCreateText(input: {
  x: number
  y: number
  text: string
  font_size?: number
  color?: string
}): AgentToolResult {
  const textEl = createTextElement(
    input.x,
    input.y,
    input.text,
    input.font_size || 20,
    input.color || '#1e1e1e'
  )

  return {
    elements: [textEl],
    description: `Created text "${input.text}" at (${input.x}, ${input.y})`
  }
}

export function executeCreateArrow(input: {
  start_x: number
  start_y: number
  end_x: number
  end_y: number
  label?: string
  stroke_color?: string
}): AgentToolResult {
  const arrowId = nextId()
  const elements: ExcalidrawElement[] = []

  const arrow = baseElement({
    id: arrowId,
    type: 'arrow',
    x: input.start_x,
    y: input.start_y,
    width: input.end_x - input.start_x,
    height: input.end_y - input.start_y,
    strokeColor: input.stroke_color || '#1e1e1e',
    backgroundColor: 'transparent',
    points: [[0, 0], [input.end_x - input.start_x, input.end_y - input.start_y]],
    startArrowhead: null,
    endArrowhead: 'arrow',
    roundness: { type: 2 }
  } as Partial<ExcalidrawElement>)

  elements.push(arrow)

  // Add label on arrow
  if (input.label) {
    const midX = (input.start_x + input.end_x) / 2
    const midY = (input.start_y + input.end_y) / 2
    const textEl = createTextElement(midX, midY - 15, input.label, 14, '#666666')
    elements.push(textEl)
  }

  return {
    elements,
    description: `Created arrow from (${input.start_x}, ${input.start_y}) to (${input.end_x}, ${input.end_y})${input.label ? ` labeled "${input.label}"` : ''}`
  }
}

export async function executeGenerateIllustration(input: {
  prompt: string
  x: number
  y: number
  width?: number
  height?: number
}): Promise<AgentToolResult> {
  const width = input.width || 150
  const height = input.height || 150

  try {
    const falClient = getFalClient()
    const result = await falClient.subscribe('fal-ai/recraft/v3/text-to-image', {
      input: {
        prompt: `simple hand-drawn educational illustration, digital illustration style, ${input.prompt}`,
        image_size: 'square',
        num_images: 1,
        style: 'digital_illustration'
      }
    }) as { data: { images: { url: string }[] } }

    const imageUrl = result.data?.images?.[0]?.url
    if (!imageUrl) {
      throw new Error('No image generated')
    }

    // Fetch image and convert to base64
    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = 'image/png'
    const dataURL = `data:${mimeType};base64,${base64}`

    const fileId = `img_${nextId()}`
    const imageEl = baseElement({
      type: 'image',
      x: input.x,
      y: input.y,
      width,
      height,
      fileId,
      status: 'saved',
      scale: [1, 1]
    } as Partial<ExcalidrawElement>)

    return {
      elements: [imageEl],
      files: {
        [fileId]: {
          mimeType,
          id: fileId,
          dataURL
        }
      },
      description: `Generated illustration "${input.prompt}" at (${input.x}, ${input.y})`
    }
  } catch (error) {
    // If image gen fails, create a placeholder rectangle with the prompt as text
    const placeholder = baseElement({
      type: 'rectangle',
      x: input.x,
      y: input.y,
      width,
      height,
      backgroundColor: '#f0f0f0',
      fillStyle: 'solid',
      strokeStyle: 'dashed'
    })

    const label = createTextElement(
      input.x + width / 2,
      input.y + height / 2,
      `[${input.prompt}]`,
      12,
      '#999999'
    )

    return {
      elements: [placeholder, label],
      description: `Placeholder for illustration "${input.prompt}" (generation failed)`
    }
  }
}

export function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>
): AgentToolResult | Promise<AgentToolResult> {
  switch (toolName) {
    case 'create_shape':
      return executeCreateShape(toolInput as Parameters<typeof executeCreateShape>[0])
    case 'create_text':
      return executeCreateText(toolInput as Parameters<typeof executeCreateText>[0])
    case 'create_arrow':
      return executeCreateArrow(toolInput as Parameters<typeof executeCreateArrow>[0])
    case 'generate_illustration':
      return executeGenerateIllustration(toolInput as Parameters<typeof executeGenerateIllustration>[0])
    case 'finish_diagram':
      return { elements: [], description: 'Diagram complete' }
    default:
      return { elements: [], description: `Unknown tool: ${toolName}` }
  }
}
