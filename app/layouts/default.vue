<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()

const navItems = computed(() => [
  { label: 'Gallery', to: '/gallery', icon: 'i-lucide-layout-grid' },
  ...(user.value ? [{ label: 'Dashboard', to: '/dashboard', icon: 'i-lucide-folder' }] : [])
])

async function logout() {
  await client.auth.signOut()
  navigateTo('/')
}
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-pencil-line" class="text-primary size-6" />
          <span class="font-bold text-lg">Doodlegram</span>
        </NuxtLink>
      </template>

      <UNavigationMenu :items="navItems" />

      <template #right>
        <template v-if="user">
          <UButton to="/create" icon="i-lucide-plus" label="New Diagram" />
          <UDropdownMenu
            :items="[
              { label: user.email || 'Account', icon: 'i-lucide-user', disabled: true },
              { label: 'Logout', icon: 'i-lucide-log-out', onSelect: logout }
            ]"
          >
            <UAvatar :alt="user.email || 'U'" size="sm" />
          </UDropdownMenu>
        </template>
        <template v-else>
          <UButton to="/login" variant="ghost" label="Log in" />
          <UButton to="/signup" label="Sign up" />
        </template>
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          Doodlegram &copy; {{ new Date().getFullYear() }} &mdash; AI-powered educational diagrams
        </p>
      </template>
    </UFooter>
  </UApp>
</template>
