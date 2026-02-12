<script setup lang="ts">
import { CATEGORIES, SUGGESTIONS } from '~/types/diagram'
import type { DiagramCategory, DiagramMode } from '~/types/diagram'

const { state, generate, cancel } = useDiagramAgent()
const { generateQuick } = useDiagramQuick()

const route = useRoute()

const prompt = ref((route.query.prompt as string) || '')
const category = ref<DiagramCategory>((route.query.category as DiagramCategory) || 'general')
const mode = ref<DiagramMode>('agent')

const isGenerating = computed(() =>
  state.value.status === 'generating' || state.value.status === 'converting'
)

async function handleGenerate() {
  if (!prompt.value.trim() || isGenerating.value) return

  if (mode.value === 'quick') {
    await generateQuick(prompt.value, category.value)
  } else {
    await generate(prompt.value, category.value)
  }
}

function useSuggestion(suggestion: string) {
  prompt.value = suggestion
  handleGenerate()
}

const categoryItems = CATEGORIES.map(c => ({
  label: c.label,
  value: c.value,
  icon: c.icon
}))
</script>

<template>
  <div class="flex flex-col gap-4">
    <div>
      <h2 class="font-semibold text-lg mb-1">Create a Diagram</h2>
      <p class="text-sm text-muted">Describe what you want to visualize</p>
    </div>

    <!-- Mode toggle -->
    <div class="flex gap-1 p-1 bg-muted/50 rounded-lg">
      <button
        class="flex-1 px-3 py-1.5 text-sm rounded-md transition-colors"
        :class="mode === 'agent' ? 'bg-default shadow-sm font-medium' : 'text-muted hover:text-default'"
        @click="mode = 'agent'"
      >
        <UIcon name="i-lucide-sparkles" class="size-3.5 mr-1" />
        AI Agent
      </button>
      <button
        class="flex-1 px-3 py-1.5 text-sm rounded-md transition-colors"
        :class="mode === 'quick' ? 'bg-default shadow-sm font-medium' : 'text-muted hover:text-default'"
        @click="mode = 'quick'"
      >
        <UIcon name="i-lucide-zap" class="size-3.5 mr-1" />
        Quick
      </button>
    </div>

    <!-- Category -->
    <UFormField label="Subject">
      <USelectMenu
        v-model="category"
        :items="categoryItems"
        value-key="value"
        placeholder="Select subject"
      />
    </UFormField>

    <!-- Prompt -->
    <UFormField label="Describe your diagram">
      <UTextarea
        v-model="prompt"
        :rows="4"
        placeholder="e.g. Explain the water cycle with evaporation, condensation, and precipitation"
        :disabled="isGenerating"
        @keydown.meta.enter="handleGenerate"
      />
    </UFormField>

    <!-- Generate / Cancel -->
    <UButton
      v-if="!isGenerating"
      block
      size="lg"
      :disabled="!prompt.trim()"
      icon="i-lucide-sparkles"
      :label="mode === 'agent' ? 'Generate with AI Agent' : 'Quick Generate'"
      @click="handleGenerate"
    />
    <UButton
      v-else
      block
      size="lg"
      color="neutral"
      variant="outline"
      icon="i-lucide-square"
      label="Cancel"
      @click="cancel"
    />

    <!-- Suggestions -->
    <div v-if="state.status === 'idle'">
      <p class="text-xs text-muted mb-2 font-medium">Try these:</p>
      <div class="flex flex-wrap gap-1.5">
        <UButton
          v-for="s in SUGGESTIONS"
          :key="s"
          size="xs"
          variant="soft"
          color="neutral"
          :label="s"
          @click="useSuggestion(s)"
        />
      </div>
    </div>

    <!-- Agent progress -->
    <div v-if="state.agentSteps.length > 0 && isGenerating" class="space-y-1">
      <p class="text-xs text-muted font-medium">Agent progress:</p>
      <div class="max-h-40 overflow-y-auto space-y-0.5">
        <div
          v-for="(step, i) in state.agentSteps"
          :key="i"
          class="text-xs text-muted flex items-center gap-1.5"
        >
          <UIcon
            :name="i === state.agentSteps.length - 1 ? 'i-lucide-loader-2' : 'i-lucide-check'"
            :class="i === state.agentSteps.length - 1 ? 'animate-spin text-primary' : 'text-green-500'"
            class="size-3 shrink-0"
          />
          {{ step }}
        </div>
      </div>
    </div>

    <!-- Error -->
    <UAlert
      v-if="state.error"
      color="error"
      :description="state.error"
      icon="i-lucide-alert-circle"
    />
  </div>
</template>
