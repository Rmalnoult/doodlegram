<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const user = useSupabaseUser()

const heroLinks = computed(() => [
  {
    label: user.value ? 'Go to Dashboard' : 'Get started for free',
    to: user.value ? '/dashboard' : '/signup',
    trailingIcon: 'i-lucide-arrow-right',
    size: 'xl' as const
  },
  {
    label: 'Browse templates',
    to: '/gallery',
    icon: 'i-lucide-layout-grid',
    size: 'xl' as const,
    color: 'neutral' as const,
    variant: 'subtle' as const
  }
])

const howItWorksFeatures = [
  {
    icon: 'i-lucide-message-square-text',
    title: '1. Describe your concept',
    description: 'Type a prompt like "Explain the water cycle" or "Show how photosynthesis works". Our AI understands educational topics.'
  },
  {
    icon: 'i-lucide-sparkles',
    title: '2. AI builds your diagram',
    description: 'Watch as our AI agent creates shapes, adds labels, draws arrows, and generates illustrations in real-time on a canvas.'
  },
  {
    icon: 'i-lucide-download',
    title: '3. Export and use',
    description: 'Download as PNG or SVG for your slides, worksheets, or classroom materials. Edit anything on the canvas before exporting.'
  }
]

const features = [
  {
    icon: 'i-lucide-pencil-line',
    title: 'Hand-drawn aesthetic',
    description: 'Sketch-style diagrams that are approachable and engaging, perfect for students of all ages.'
  },
  {
    icon: 'i-lucide-bot',
    title: 'AI-powered agent',
    description: 'Claude AI reasons about layout, colors, and structure. It designs your diagram element by element.'
  },
  {
    icon: 'i-lucide-image-plus',
    title: 'AI illustrations',
    description: 'Enrich diagrams with AI-generated illustrations. Our agent adds relevant visuals to make concepts come alive.'
  },
  {
    icon: 'i-lucide-folder',
    title: 'Save and organize',
    description: 'Keep all your diagrams in one place. Organize by subject, search, and revisit anytime.'
  },
  {
    icon: 'i-lucide-zap',
    title: 'Quick mode',
    description: 'Need a simple flowchart fast? Quick mode generates structured diagrams in seconds.'
  },
  {
    icon: 'i-lucide-graduation-cap',
    title: 'Template gallery',
    description: 'Browse pre-made templates for Science, Math, History, Biology and more.'
  }
]

const ctaLinks = computed(() => [
  {
    label: user.value ? 'Create a diagram' : 'Sign up free',
    to: user.value ? '/create' : '/signup',
    trailingIcon: 'i-lucide-arrow-right',
    color: 'neutral' as const
  },
  {
    label: 'Browse templates',
    to: '/gallery',
    icon: 'i-lucide-layout-grid',
    color: 'neutral' as const,
    variant: 'outline' as const
  }
])
</script>

<template>
  <div>
    <UPageHero
      title="Turn any concept into a beautiful hand-drawn diagram"
      description="Doodlegram uses AI to generate Excalidraw-style educational diagrams from simple text prompts. Just describe what you want to teach, and watch it come to life."
      orientation="horizontal"
      :links="heroLinks"
    >
      <img
        src="/hero-illustration.jpg"
        alt="Hand-drawn educational diagram of the water cycle created by Doodlegram"
        class="rounded-lg shadow-2xl ring ring-default"
      />
    </UPageHero>

    <UPageSection
      id="how-it-works"
      title="Create diagrams in 3 simple steps"
      description="No design skills needed. Just describe the concept and let AI do the rest."
      :features="howItWorksFeatures"
    />

    <UPageSection
      title="Built for educators"
      description="Every feature is designed with teachers, trainers, and content creators in mind."
      :features="features"
    />

    <UPageSection>
      <UPageCTA
        title="Ready to transform how you create educational visuals?"
        description="Join educators who save hours creating diagrams for their lessons. Start for free."
        variant="subtle"
        :links="ctaLinks"
      />
    </UPageSection>
  </div>
</template>
