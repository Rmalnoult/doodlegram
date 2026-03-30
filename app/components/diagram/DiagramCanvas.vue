<script setup lang="ts">
const { state } = useDiagramAgent()

// Dynamically loaded Excalidraw wrapped as Vue component
const ExcalidrawVue = shallowRef<ReturnType<typeof import('veaury')['applyPureReactInVue']> | null>(null)

// Excalidraw imperative API reference
const excalidrawAPI = shallowRef<any>(null)

// Key to force remount when loading a saved diagram
const excalidrawKey = ref(0)

// Flag to suppress onChange during programmatic updateScene calls
let isProgrammaticUpdate = false

// Load Excalidraw + veaury client-side only (Excalidraw accesses window at import time)
onMounted(async () => {
  const [{ Excalidraw }, { applyPureReactInVue }] = await Promise.all([
    import('@excalidraw/excalidraw'),
    import('veaury'),
    import('@excalidraw/excalidraw/index.css')
  ])
  ExcalidrawVue.value = applyPureReactInVue(Excalidraw)
})

function handleExcalidrawAPI(api: any) {
  excalidrawAPI.value = api
}

function handleChange(elements: any[], _appState: any, files: any) {
  if (isProgrammaticUpdate) return
  // Only sync user edits back to state when diagram is ready (not during generation)
  if (state.value.status !== 'ready') return
  state.value.elements = [...elements]
  if (files) {
    state.value.files = { ...files }
  }
}

// Props passed to the React Excalidraw component
const excalidrawProps = computed(() => ({
  initialData: {
    elements: state.value.elements,
    files: state.value.files,
    appState: { viewBackgroundColor: '#ffffff' }
  },
  excalidrawAPI: handleExcalidrawAPI,
  onChange: handleChange,
  theme: 'light',
  langCode: 'en',
  UIOptions: {
    canvasActions: {
      loadScene: false,
      saveToActiveFile: false,
      export: false,
      saveAsImage: false
    }
  }
}))

// Watch for new elements during SSE streaming and push into Excalidraw
watch(
  () => state.value.elements,
  (newElements) => {
    if (!excalidrawAPI.value) return
    if (state.value.status !== 'generating' && state.value.status !== 'converting') return

    isProgrammaticUpdate = true
    excalidrawAPI.value.updateScene({ elements: newElements })

    nextTick(() => {
      excalidrawAPI.value?.scrollToContent(undefined, { fitToViewport: true })
      isProgrammaticUpdate = false
    })
  }
)

// Watch for new files during streaming
watch(
  () => state.value.files,
  (newFiles) => {
    if (!excalidrawAPI.value) return
    if (state.value.status !== 'generating' && state.value.status !== 'converting') return

    const filesArray = Object.values(newFiles).filter(Boolean)
    if (filesArray.length > 0) {
      excalidrawAPI.value.addFiles(filesArray)
    }
  }
)

// Handle status transitions
watch(
  () => state.value.status,
  (newStatus, oldStatus) => {
    // After generation completes, scroll to fit
    if (newStatus === 'ready' && (oldStatus === 'generating' || oldStatus === 'converting')) {
      nextTick(() => {
        excalidrawAPI.value?.scrollToContent(undefined, {
          fitToViewport: true,
          animate: true
        })
      })
    }

    // When loading a saved diagram (idle -> ready), force remount with new data
    if (newStatus === 'ready' && oldStatus === 'idle') {
      excalidrawKey.value++
    }

    // When starting a new generation, force remount to clear the canvas
    if (newStatus === 'generating' && oldStatus !== 'generating') {
      excalidrawKey.value++
    }
  }
)

const showExcalidraw = computed(() => {
  return state.value.elements.length > 0 || state.value.status === 'ready'
})
</script>

<template>
  <div class="w-full h-full relative bg-white">
    <!-- Empty state -->
    <div
      v-if="!showExcalidraw && state.status === 'idle'"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="text-center">
        <UIcon name="i-lucide-pencil-ruler" class="size-16 text-muted/40 mb-4" />
        <p class="text-lg text-muted/60 font-medium">Your diagram will appear here</p>
        <p class="text-sm text-muted/40 mt-1">Enter a prompt and click Generate</p>
      </div>
    </div>

    <!-- Loading state (before first elements arrive) -->
    <div
      v-if="!showExcalidraw && (state.status === 'generating' || state.status === 'converting')"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="text-center">
        <UIcon name="i-lucide-loader-2" class="size-12 text-primary animate-spin mb-4" />
        <p class="text-lg text-muted font-medium">Building your diagram...</p>
        <p class="text-sm text-muted/60 mt-1">The AI agent is placing elements on the canvas</p>
      </div>
    </div>

    <!-- Interactive Excalidraw Canvas -->
    <ClientOnly>
      <div v-if="showExcalidraw && ExcalidrawVue" class="w-full h-full">
        <component
          :is="ExcalidrawVue"
          :key="excalidrawKey"
          v-bind="excalidrawProps"
        />
      </div>
    </ClientOnly>

    <!-- Title overlay -->
    <div
      v-if="state.title && state.status === 'ready'"
      class="absolute bottom-4 left-4 bg-default/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-default z-50"
    >
      <p class="text-sm font-medium">{{ state.title }}</p>
      <p v-if="state.description" class="text-xs text-muted">{{ state.description }}</p>
    </div>
  </div>
</template>
