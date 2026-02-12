<script setup lang="ts">
definePageMeta({
  layout: 'app',
  middleware: 'auth'
})
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-full lg:h-full">
    <!-- Sidebar: Prompt input -->
    <aside class="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-default bg-elevated/50 p-4 flex flex-col gap-4 overflow-y-auto shrink-0">
      <DiagramPromptInput />

      <div class="mt-auto pt-4 border-t border-default">
        <DiagramToolbar />
      </div>
    </aside>

    <!-- Main: Canvas area -->
    <main class="flex-1 min-h-[50vh] lg:min-h-0 overflow-hidden">
      <DiagramCanvas />
    </main>
  </div>
</template>
