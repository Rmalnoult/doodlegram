<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

const client = useSupabaseClient()
const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  loading.value = true
  error.value = ''

  const { error: authError } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (authError) {
    error.value = authError.message
    loading.value = false
    return
  }

  loading.value = false
  router.push('/dashboard')
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="text-center">
          <UIcon name="i-lucide-pencil-line" class="text-primary size-10 mb-2" />
          <h1 class="text-2xl font-bold">Welcome back</h1>
          <p class="text-sm text-muted mt-1">Sign in to your Doodlegram account</p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="login">
        <UFormField label="Email">
          <UInput
            v-model="email"
            type="email"
            placeholder="you@school.edu"
            icon="i-lucide-mail"
            required
            autofocus
          />
        </UFormField>

        <UFormField label="Password">
          <UInput
            v-model="password"
            type="password"
            placeholder="Your password"
            icon="i-lucide-lock"
            required
          />
        </UFormField>

        <UAlert v-if="error" color="error" :description="error" icon="i-lucide-alert-circle" />

        <UButton type="submit" block :loading="loading" label="Sign in" />
      </form>

      <template #footer>
        <p class="text-center text-sm text-muted">
          Don't have an account?
          <NuxtLink to="/signup" class="text-primary font-medium hover:underline">
            Sign up
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
