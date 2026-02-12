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

async function signup() {
  loading.value = true
  error.value = ''

  const { error: authError } = await client.auth.signUp({
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
          <h1 class="text-2xl font-bold">Create your account</h1>
          <p class="text-sm text-muted mt-1">Start creating educational diagrams in seconds</p>
        </div>
      </template>

      <form class="space-y-4" @submit.prevent="signup">
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
            placeholder="Choose a password (min 6 chars)"
            icon="i-lucide-lock"
            required
            minlength="6"
          />
        </UFormField>

        <UAlert v-if="error" color="error" :description="error" icon="i-lucide-alert-circle" />

        <UButton type="submit" block :loading="loading" label="Create account" />
      </form>

      <template #footer>
        <p class="text-center text-sm text-muted">
          Already have an account?
          <NuxtLink to="/login" class="text-primary font-medium hover:underline">
            Sign in
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>
