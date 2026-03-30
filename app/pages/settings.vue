<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const router = useRouter()

// --- Password Change ---
const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})
const passwordLoading = ref(false)
const passwordError = ref('')

async function changePassword() {
  passwordError.value = ''

  if (passwordForm.newPassword.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }

  passwordLoading.value = true

  const { error } = await client.auth.updateUser({
    password: passwordForm.newPassword
  })

  if (error) {
    passwordError.value = error.message
    passwordLoading.value = false
    return
  }

  passwordLoading.value = false
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  toast.add({ title: 'Password updated', icon: 'i-lucide-check' })
}

// --- Account Deletion ---
const showDeleteDialog = ref(false)
const deleteLoading = ref(false)
const deleteError = ref('')
const deleteConfirmText = ref('')

async function deleteAccount() {
  deleteError.value = ''
  deleteLoading.value = true

  try {
    await $fetch('/api/auth/delete-account', { method: 'POST' })
    await client.auth.signOut()
    router.push('/')
    toast.add({ title: 'Account deleted', icon: 'i-lucide-check' })
  } catch (err: any) {
    deleteError.value = err?.data?.statusMessage || 'Failed to delete account'
    deleteLoading.value = false
  }
}
</script>

<template>
  <UContainer class="py-12 max-w-2xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Settings</h1>
      <p class="text-muted mt-1">Manage your account settings</p>
    </div>

    <div class="space-y-6">
      <!-- Profile Section -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-user" class="size-5" />
            <h2 class="font-semibold text-lg">Profile</h2>
          </div>
        </template>

        <UFormField label="Email">
          <UInput
            :model-value="user?.email || ''"
            icon="i-lucide-mail"
            disabled
          />
        </UFormField>
        <p class="text-xs text-muted mt-2">
          Email address cannot be changed from this page.
        </p>
      </UCard>

      <!-- Password Change Section -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-lock" class="size-5" />
            <h2 class="font-semibold text-lg">Change Password</h2>
          </div>
        </template>

        <form class="space-y-4" @submit.prevent="changePassword">
          <UFormField label="New password">
            <UInput
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="New password (min 6 chars)"
              icon="i-lucide-lock"
              required
              minlength="6"
            />
          </UFormField>

          <UFormField label="Confirm new password">
            <UInput
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="Confirm new password"
              icon="i-lucide-lock"
              required
            />
          </UFormField>

          <UAlert
            v-if="passwordError"
            color="error"
            :description="passwordError"
            icon="i-lucide-alert-circle"
          />

          <UButton
            type="submit"
            :loading="passwordLoading"
            :disabled="!passwordForm.newPassword || !passwordForm.confirmPassword"
            icon="i-lucide-save"
            label="Update password"
          />
        </form>
      </UCard>

      <!-- Danger Zone -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2 text-error">
            <UIcon name="i-lucide-alert-triangle" class="size-5" />
            <h2 class="font-semibold text-lg">Danger Zone</h2>
          </div>
        </template>

        <p class="text-sm text-muted mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        <UButton
          color="error"
          variant="outline"
          icon="i-lucide-trash-2"
          label="Delete my account"
          @click="showDeleteDialog = true"
        />
      </UCard>
    </div>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="showDeleteDialog">
      <template #content>
        <div class="p-6">
          <div class="flex items-center gap-2 mb-4 text-error">
            <UIcon name="i-lucide-alert-triangle" class="size-6" />
            <h3 class="text-lg font-semibold">Delete Account</h3>
          </div>

          <p class="text-sm text-muted mb-4">
            This will permanently delete your account, all your diagrams, and all associated data.
            This action cannot be undone.
          </p>

          <UFormField label="Type DELETE to confirm">
            <UInput
              v-model="deleteConfirmText"
              placeholder="DELETE"
              icon="i-lucide-alert-circle"
            />
          </UFormField>

          <UAlert
            v-if="deleteError"
            color="error"
            :description="deleteError"
            icon="i-lucide-alert-circle"
            class="mt-4"
          />

          <div class="flex justify-end gap-2 mt-6">
            <UButton
              variant="ghost"
              label="Cancel"
              @click="showDeleteDialog = false"
            />
            <UButton
              color="error"
              :loading="deleteLoading"
              :disabled="deleteConfirmText !== 'DELETE'"
              icon="i-lucide-trash-2"
              label="Delete account permanently"
              @click="deleteAccount"
            />
          </div>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>
