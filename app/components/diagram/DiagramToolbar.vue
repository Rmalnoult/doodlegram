<script setup lang="ts">
const { state, reset } = useDiagramAgent()
const { exportAsPng, exportAsSvg } = useExcalidrawExport()
const { saveDiagram } = useDiagramStorage()
const toast = useToast()

const saving = ref(false)

const hasElements = computed(() => state.value.elements.length > 0)
const isReady = computed(() => state.value.status === 'ready')

async function handleExportPng() {
  if (!hasElements.value) return
  try {
    await exportAsPng(state.value.elements, state.value.files)
    toast.add({ title: 'Exported as PNG', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Export failed', color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

async function handleExportSvg() {
  if (!hasElements.value) return
  try {
    await exportAsSvg(state.value.elements, state.value.files)
    toast.add({ title: 'Exported as SVG', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Export failed', color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

async function handleSave() {
  if (!hasElements.value || saving.value) return
  saving.value = true

  try {
    await saveDiagram({
      title: state.value.title || 'Untitled Diagram',
      description: state.value.description,
      category: state.value.category,
      prompt: state.value.prompt,
      excalidrawJson: {
        elements: state.value.elements,
        files: state.value.files
      }
    })
    toast.add({ title: 'Diagram saved!', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Save failed', color: 'error', icon: 'i-lucide-alert-circle' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      :disabled="!hasElements"
      variant="ghost"
      size="sm"
      icon="i-lucide-download"
      label="PNG"
      @click="handleExportPng"
    />
    <UButton
      :disabled="!hasElements"
      variant="ghost"
      size="sm"
      icon="i-lucide-file-code"
      label="SVG"
      @click="handleExportSvg"
    />

    <USeparator orientation="vertical" class="h-5" />

    <UButton
      :disabled="!isReady"
      :loading="saving"
      variant="soft"
      size="sm"
      icon="i-lucide-save"
      label="Save"
      @click="handleSave"
    />

    <UButton
      :disabled="!hasElements"
      variant="ghost"
      color="neutral"
      size="sm"
      icon="i-lucide-rotate-ccw"
      label="Reset"
      @click="reset"
    />
  </div>
</template>
