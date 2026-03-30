<script setup lang="ts">
import { CATEGORIES } from '~/types/diagram'
import type { DiagramCategory } from '~/types/diagram'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { diagrams, loading, fetchDiagrams, deleteDiagram } = useDiagramStorage()
const toast = useToast()
const user = useSupabaseUser()

watch(user, (u) => {
  if (u?.id) fetchDiagrams()
}, { immediate: true })

// Search & filter state
const searchQuery = ref('')
const selectedCategory = ref<DiagramCategory | 'all'>('all')
const sortBy = ref<'newest' | 'oldest' | 'alpha'>('newest')

const categoryOptions = computed(() => [
  { label: 'All Categories', value: 'all', icon: 'i-lucide-grid-2x2' },
  ...CATEGORIES.map(c => ({ label: c.label, value: c.value, icon: c.icon }))
])

const sortOptions = [
  { label: 'Newest first', value: 'newest', icon: 'i-lucide-arrow-down-wide-narrow' },
  { label: 'Oldest first', value: 'oldest', icon: 'i-lucide-arrow-up-narrow-wide' },
  { label: 'Alphabetical', value: 'alpha', icon: 'i-lucide-arrow-down-a-z' }
]

const filteredDiagrams = computed(() => {
  let result = [...diagrams.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(d =>
      d.title.toLowerCase().includes(query)
      || (d.description && d.description.toLowerCase().includes(query))
    )
  }

  if (selectedCategory.value !== 'all') {
    result = result.filter(d => d.category === selectedCategory.value)
  }

  if (sortBy.value === 'newest') {
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sortBy.value === 'oldest') {
    result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  } else if (sortBy.value === 'alpha') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  }

  return result
})

const hasActiveFilters = computed(() =>
  searchQuery.value.trim() !== '' || selectedCategory.value !== 'all'
)

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  sortBy.value = 'newest'
}

async function handleDelete(id: string) {
  try {
    await deleteDiagram(id)
    toast.add({ title: 'Diagram deleted', icon: 'i-lucide-check' })
  } catch {
    toast.add({ title: 'Delete failed', color: 'error', icon: 'i-lucide-alert-circle' })
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <UContainer class="py-12">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold">My Diagrams</h1>
        <p class="text-muted mt-1">Your AI-generated educational diagrams</p>
      </div>
      <UButton to="/create" icon="i-lucide-plus" label="New Diagram" size="lg" />
    </div>

    <!-- Search & Filter bar -->
    <div v-if="diagrams.length > 0 || hasActiveFilters" class="flex flex-col sm:flex-row gap-3 mb-6">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        placeholder="Search diagrams..."
        class="flex-1"
      />
      <div class="flex gap-2">
        <USelectMenu
          v-model="selectedCategory"
          :items="categoryOptions"
          value-key="value"
          placeholder="Category"
          class="w-44"
        />
        <USelectMenu
          v-model="sortBy"
          :items="sortOptions"
          value-key="value"
          class="w-44"
        />
      </div>
    </div>

    <!-- Result count -->
    <p v-if="diagrams.length > 0 && hasActiveFilters" class="text-sm text-muted mb-4">
      Showing {{ filteredDiagrams.length }} of {{ diagrams.length }} diagrams
    </p>

    <!-- Loading state -->
    <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <USkeleton v-for="i in 6" :key="i" class="h-48 rounded-xl" />
    </div>

    <!-- Empty state: no diagrams at all -->
    <div
      v-else-if="diagrams.length === 0"
      class="flex flex-col items-center justify-center py-24 text-center"
    >
      <UIcon name="i-lucide-image" class="size-16 text-muted mb-4" />
      <h2 class="text-xl font-semibold mb-2">No diagrams yet</h2>
      <p class="text-muted mb-6 max-w-md">
        Create your first educational diagram by describing a concept. Our AI will generate a beautiful hand-drawn diagram for you.
      </p>
      <UButton to="/create" icon="i-lucide-plus" label="Create your first diagram" size="lg" />
    </div>

    <!-- Empty state: no results from filter -->
    <div
      v-else-if="filteredDiagrams.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <UIcon name="i-lucide-search-x" class="size-12 text-muted mb-4" />
      <h2 class="text-lg font-semibold mb-2">No matching diagrams</h2>
      <p class="text-muted mb-4 max-w-md">
        No diagrams match your current search or filters. Try adjusting your criteria.
      </p>
      <UButton
        variant="outline"
        icon="i-lucide-x"
        label="Clear filters"
        @click="clearFilters"
      />
    </div>

    <!-- Diagrams grid -->
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="diagram in filteredDiagrams"
        :key="diagram.id"
        class="group hover:shadow-md transition-shadow"
      >
        <!-- Preview area -->
        <div class="h-32 bg-muted/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          <img
            v-if="diagram.thumbnail_url"
            :src="diagram.thumbnail_url"
            :alt="diagram.title"
            class="w-full h-full object-contain"
            loading="lazy"
          >
          <UIcon v-else name="i-lucide-file-image" class="size-8 text-muted/40" />
        </div>

        <h3 class="font-semibold truncate">{{ diagram.title }}</h3>
        <p v-if="diagram.description" class="text-sm text-muted line-clamp-2 mt-1">
          {{ diagram.description }}
        </p>
        <UBadge
          v-if="diagram.category && diagram.category !== 'general'"
          :label="diagram.category"
          variant="subtle"
          size="xs"
          class="mt-1 capitalize"
        />

        <div class="flex items-center justify-between mt-3">
          <span class="text-xs text-muted">{{ formatDate(diagram.created_at) }}</span>

          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton
              :to="`/create?load=${diagram.id}`"
              size="xs"
              variant="ghost"
              icon="i-lucide-pencil"
              label="Open"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash-2"
              @click="handleDelete(diagram.id)"
            />
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>
