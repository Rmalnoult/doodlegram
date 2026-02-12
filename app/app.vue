<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Doodlegram — AI-Powered Educational Diagrams',
  description: 'Generate hand-drawn educational diagrams from simple text prompts. Built for educators.',
  ogTitle: 'Doodlegram — AI-Powered Educational Diagrams',
  ogDescription: 'Generate hand-drawn educational diagrams from simple text prompts. Built for educators.'
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
