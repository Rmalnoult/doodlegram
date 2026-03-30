<script setup lang="ts">
import type { DiagramCategory } from '~/types/diagram'

definePageMeta({
  layout: 'default'
})

const user = useSupabaseUser()
const router = useRouter()

const selectedCategory = ref('all')

const categories = [
  { value: 'all', label: 'All' },
  { value: 'science', label: 'Science' },
  { value: 'biology', label: 'Biology' },
  { value: 'math', label: 'Math' },
  { value: 'history', label: 'History' },
  { value: 'language', label: 'Language Arts' },
  { value: 'geography', label: 'Geography' }
]

const templates = [
  {
    title: 'The Water Cycle',
    description: 'Evaporation, condensation, precipitation, and collection — the complete water cycle explained.',
    category: 'science' as DiagramCategory,
    categoryLabel: 'Science',
    prompt: 'The water cycle showing evaporation from oceans, condensation into clouds, precipitation as rain, and collection back into rivers and oceans',
    icon: 'i-lucide-droplets'
  },
  {
    title: 'Photosynthesis',
    description: 'How plants convert sunlight, water, and CO2 into glucose and oxygen.',
    category: 'biology' as DiagramCategory,
    categoryLabel: 'Biology',
    prompt: 'Photosynthesis process showing sunlight, water, and carbon dioxide going into a plant leaf, and glucose and oxygen coming out',
    icon: 'i-lucide-leaf'
  },
  {
    title: 'Solar System',
    description: 'The eight planets orbiting the Sun, from Mercury to Neptune.',
    category: 'science' as DiagramCategory,
    categoryLabel: 'Science',
    prompt: 'The solar system with the Sun in the center and all 8 planets in order: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune',
    icon: 'i-lucide-orbit'
  },
  {
    title: 'Food Chain',
    description: 'A simple food chain from producers to top predators.',
    category: 'biology' as DiagramCategory,
    categoryLabel: 'Biology',
    prompt: 'A food chain showing: Sun → Grass (producer) → Grasshopper (primary consumer) → Frog (secondary consumer) → Snake (tertiary consumer) → Eagle (apex predator)',
    icon: 'i-lucide-link'
  },
  {
    title: 'Cell Division (Mitosis)',
    description: 'The stages of mitosis: prophase, metaphase, anaphase, telophase.',
    category: 'biology' as DiagramCategory,
    categoryLabel: 'Biology',
    prompt: 'The stages of mitosis: Interphase → Prophase → Metaphase → Anaphase → Telophase → Cytokinesis, showing the cell at each stage',
    icon: 'i-lucide-circle-dot'
  },
  {
    title: 'Branches of Government',
    description: 'The three branches: Legislative, Executive, and Judicial with checks and balances.',
    category: 'history' as DiagramCategory,
    categoryLabel: 'History',
    prompt: 'Three branches of the US government: Legislative (Congress), Executive (President), Judicial (Supreme Court) with arrows showing checks and balances between them',
    icon: 'i-lucide-landmark'
  },
  {
    title: 'States of Matter',
    description: 'Solid, liquid, gas, and the transitions between them.',
    category: 'science' as DiagramCategory,
    categoryLabel: 'Science',
    prompt: 'States of matter diagram showing Solid, Liquid, and Gas with arrows between them labeled: melting, freezing, evaporation, condensation, sublimation, deposition',
    icon: 'i-lucide-flask-conical'
  },
  {
    title: 'Scientific Method',
    description: 'The steps of the scientific method as a flowchart.',
    category: 'science' as DiagramCategory,
    categoryLabel: 'Science',
    prompt: 'The scientific method as a flowchart: Observation → Question → Hypothesis → Experiment → Analyze Results → Conclusion, with a loop back from Conclusion to Hypothesis if results don\'t support it',
    icon: 'i-lucide-microscope'
  },
  {
    title: 'Parts of a Plant',
    description: 'Roots, stem, leaves, flower — each part labeled with its function.',
    category: 'biology' as DiagramCategory,
    categoryLabel: 'Biology',
    prompt: 'A labeled diagram of a plant showing: roots (absorb water), stem (transport), leaves (photosynthesis), flower (reproduction), with labels and descriptions for each part',
    icon: 'i-lucide-flower-2'
  },
  {
    title: 'The Digestive System',
    description: 'Food\'s journey from mouth to intestines.',
    category: 'biology' as DiagramCategory,
    categoryLabel: 'Biology',
    prompt: 'The human digestive system showing the path of food: Mouth → Esophagus → Stomach → Small Intestine → Large Intestine → Rectum, with brief labels for what happens at each stage',
    icon: 'i-lucide-heart-pulse'
  },
  {
    title: 'Timeline: World War II',
    description: 'Key events from 1939 to 1945.',
    category: 'history' as DiagramCategory,
    categoryLabel: 'History',
    prompt: 'A timeline of World War II key events: 1939 Germany invades Poland, 1940 Battle of Britain, 1941 Pearl Harbor, 1942 Battle of Stalingrad, 1944 D-Day, 1945 VE Day and VJ Day',
    icon: 'i-lucide-clock'
  },
  {
    title: 'Fractions Explained',
    description: 'Visual explanation of fractions with pie charts and number lines.',
    category: 'math' as DiagramCategory,
    categoryLabel: 'Math',
    prompt: 'Visual explanation of fractions showing: a whole circle, then circles divided into halves, thirds, and quarters, with fraction labels 1/2, 1/3, 1/4 and a number line from 0 to 1 showing where each fraction falls',
    icon: 'i-lucide-pie-chart'
  }
]

const filteredTemplates = computed(() => {
  if (selectedCategory.value === 'all') return templates
  return templates.filter(t => t.category === selectedCategory.value)
})

function useTemplate(template: typeof templates[0]) {
  if (!user.value) {
    router.push('/login')
    return
  }
  router.push({
    path: '/create',
    query: { prompt: template.prompt, category: template.category }
  })
}
</script>

<template>
  <UContainer class="py-12">
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold">Template Gallery</h1>
      <p class="text-muted mt-2 max-w-lg mx-auto">
        Browse pre-made educational diagram templates. Click to use one as a starting point.
      </p>
    </div>

    <div class="flex items-center justify-center gap-2 mb-8 flex-wrap">
      <UButton
        v-for="cat in categories"
        :key="cat.value"
        :label="cat.label"
        :variant="selectedCategory === cat.value ? 'solid' : 'ghost'"
        :color="selectedCategory === cat.value ? 'primary' : 'neutral'"
        size="sm"
        @click="selectedCategory = cat.value"
      />
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="template in filteredTemplates"
        :key="template.title"
        class="group cursor-pointer"
        @click="useTemplate(template)"
      >
        <UCard class="h-full hover:shadow-lg transition-all group-hover:-translate-y-0.5">
          <div class="flex items-start gap-3 mb-3">
            <div class="p-2 rounded-lg bg-primary/10">
              <UIcon :name="template.icon" class="size-5 text-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold">{{ template.title }}</h3>
              <UBadge :label="template.categoryLabel" variant="subtle" size="xs" class="mt-1" />
            </div>
          </div>
          <p class="text-sm text-muted line-clamp-2">{{ template.description }}</p>
          <div class="flex items-center gap-1 mt-3 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <UIcon name="i-lucide-sparkles" class="size-3.5" />
            <span>Use this template</span>
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>
