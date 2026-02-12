<script setup lang="ts">
const { state } = useDiagramAgent()

// We'll render Excalidraw elements as SVG for now
// since the React wrapper (nuxt-excalidraw / veaury) needs careful setup
// This gives us a working preview that can be swapped for full Excalidraw later

const canvasElements = computed(() => state.value.elements)
const canvasFiles = computed(() => state.value.files)

// Calculate viewBox from elements
const viewBox = computed(() => {
  if (canvasElements.value.length === 0) return '0 0 1200 800'

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const el of canvasElements.value as Array<{ x: number; y: number; width: number; height: number }>) {
    if (el.x < minX) minX = el.x
    if (el.y < minY) minY = el.y
    if (el.x + (el.width || 0) > maxX) maxX = el.x + (el.width || 0)
    if (el.y + (el.height || 0) > maxY) maxY = el.y + (el.height || 0)
  }

  const padding = 60
  return `${minX - padding} ${minY - padding} ${maxX - minX + padding * 2} ${maxY - minY + padding * 2}`
})
</script>

<template>
  <div class="w-full h-full relative bg-white">
    <!-- Empty state -->
    <div
      v-if="canvasElements.length === 0 && state.status === 'idle'"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="text-center">
        <UIcon name="i-lucide-pencil-ruler" class="size-16 text-muted/40 mb-4" />
        <p class="text-lg text-muted/60 font-medium">Your diagram will appear here</p>
        <p class="text-sm text-muted/40 mt-1">Enter a prompt and click Generate</p>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="canvasElements.length === 0 && (state.status === 'generating' || state.status === 'converting')"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="text-center">
        <UIcon name="i-lucide-loader-2" class="size-12 text-primary animate-spin mb-4" />
        <p class="text-lg text-muted font-medium">Building your diagram...</p>
        <p class="text-sm text-muted/60 mt-1">The AI agent is placing elements on the canvas</p>
      </div>
    </div>

    <!-- SVG Preview Canvas -->
    <svg
      v-if="canvasElements.length > 0"
      class="w-full h-full"
      :viewBox="viewBox"
      xmlns="http://www.w3.org/2000/svg"
    >
      <template v-for="el in canvasElements" :key="(el as any).id">
        <!-- Rectangle -->
        <g v-if="(el as any).type === 'rectangle'">
          <rect
            :x="(el as any).x"
            :y="(el as any).y"
            :width="(el as any).width"
            :height="(el as any).height"
            :fill="(el as any).backgroundColor === 'transparent' ? 'white' : (el as any).backgroundColor"
            :stroke="(el as any).strokeColor"
            :stroke-width="(el as any).strokeWidth || 2"
            :rx="8"
            :ry="8"
          />
        </g>

        <!-- Ellipse -->
        <g v-if="(el as any).type === 'ellipse'">
          <ellipse
            :cx="(el as any).x + (el as any).width / 2"
            :cy="(el as any).y + (el as any).height / 2"
            :rx="(el as any).width / 2"
            :ry="(el as any).height / 2"
            :fill="(el as any).backgroundColor === 'transparent' ? 'white' : (el as any).backgroundColor"
            :stroke="(el as any).strokeColor"
            :stroke-width="(el as any).strokeWidth || 2"
          />
        </g>

        <!-- Diamond -->
        <g v-if="(el as any).type === 'diamond'">
          <polygon
            :points="`
              ${(el as any).x + (el as any).width / 2},${(el as any).y}
              ${(el as any).x + (el as any).width},${(el as any).y + (el as any).height / 2}
              ${(el as any).x + (el as any).width / 2},${(el as any).y + (el as any).height}
              ${(el as any).x},${(el as any).y + (el as any).height / 2}
            `"
            :fill="(el as any).backgroundColor === 'transparent' ? 'white' : (el as any).backgroundColor"
            :stroke="(el as any).strokeColor"
            :stroke-width="(el as any).strokeWidth || 2"
          />
        </g>

        <!-- Text -->
        <text
          v-if="(el as any).type === 'text'"
          :x="(el as any).x + ((el as any).width || 0) / 2"
          :y="(el as any).y + ((el as any).height || 0) / 2"
          :fill="(el as any).strokeColor"
          :font-size="(el as any).fontSize || 16"
          text-anchor="middle"
          dominant-baseline="central"
          font-family="'Virgil', 'Segoe Print', 'Comic Sans MS', cursive"
        >
          {{ (el as any).text || (el as any).originalText }}
        </text>

        <!-- Arrow -->
        <g v-if="(el as any).type === 'arrow'">
          <defs>
            <marker
              :id="`arrow-${(el as any).id}`"
              viewBox="0 0 10 7"
              refX="9"
              refY="3.5"
              markerWidth="8"
              markerHeight="6"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" :fill="(el as any).strokeColor || '#1e1e1e'" />
            </marker>
          </defs>
          <line
            v-if="(el as any).points"
            :x1="(el as any).x + ((el as any).points[0]?.[0] || 0)"
            :y1="(el as any).y + ((el as any).points[0]?.[1] || 0)"
            :x2="(el as any).x + ((el as any).points[1]?.[0] || 0)"
            :y2="(el as any).y + ((el as any).points[1]?.[1] || 0)"
            :stroke="(el as any).strokeColor || '#1e1e1e'"
            :stroke-width="(el as any).strokeWidth || 2"
            :marker-end="`url(#arrow-${(el as any).id})`"
          />
        </g>

        <!-- Image -->
        <image
          v-if="(el as any).type === 'image' && canvasFiles[(el as any).fileId]"
          :x="(el as any).x"
          :y="(el as any).y"
          :width="(el as any).width"
          :height="(el as any).height"
          :href="(canvasFiles[(el as any).fileId] as any)?.dataURL"
        />
      </template>
    </svg>

    <!-- Title overlay -->
    <div
      v-if="state.title && state.status === 'ready'"
      class="absolute bottom-4 left-4 bg-default/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-default"
    >
      <p class="text-sm font-medium">{{ state.title }}</p>
      <p v-if="state.description" class="text-xs text-muted">{{ state.description }}</p>
    </div>
  </div>
</template>
