<script setup lang="ts">
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

    <!-- Loading state -->
    <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <USkeleton v-for="i in 6" :key="i" class="h-48 rounded-xl" />
    </div>

    <!-- Empty state -->
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

    <!-- Diagrams grid -->
    <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard
        v-for="diagram in diagrams"
        :key="diagram.id"
        class="group hover:shadow-md transition-shadow"
      >
        <!-- Preview area -->
        <div class="h-32 bg-muted/30 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          <UIcon name="i-lucide-file-image" class="size-8 text-muted/40" />
        </div>

        <h3 class="font-semibold truncate">{{ diagram.title }}</h3>
        <p v-if="diagram.description" class="text-sm text-muted line-clamp-2 mt-1">
          {{ diagram.description }}
        </p>

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
