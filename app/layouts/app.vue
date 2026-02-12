<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()

async function logout() {
  await client.auth.signOut()
  navigateTo('/')
}
</script>

<template>
  <UApp>
    <div class="flex flex-col h-screen">
      <header class="flex items-center justify-between px-4 py-2 border-b border-default bg-default">
        <NuxtLink to="/dashboard" class="flex items-center gap-2">
          <UIcon name="i-lucide-pencil-line" class="text-primary size-5" />
          <span class="font-semibold">Doodlegram</span>
        </NuxtLink>

        <div class="flex items-center gap-2">
          <UButton to="/dashboard" variant="ghost" icon="i-lucide-folder" size="sm" label="My Diagrams" />
          <UDropdownMenu
            :items="[
              { label: user?.email || 'Account', icon: 'i-lucide-user', disabled: true },
              { label: 'Logout', icon: 'i-lucide-log-out', onSelect: logout }
            ]"
          >
            <UAvatar :alt="user?.email || 'U'" size="xs" />
          </UDropdownMenu>
        </div>
      </header>

      <div class="flex-1 overflow-auto lg:overflow-hidden">
        <slot />
      </div>
    </div>
  </UApp>
</template>
