<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  HomeIcon,
  UsersIcon,
  BuildingOffice2Icon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()

const navigationLinks = [
  { name: 'Inicio', icon: HomeIcon, route: '/' },
  { name: 'Jugadores', icon: UsersIcon, route: '/jugadores' },
  { name: 'Clubes', icon: BuildingOffice2Icon, route: '/clubes' },
  { name: 'Partidas', icon: DocumentTextIcon, route: '/partidas' },
  { name: 'Estadísticas', icon: ChartBarIcon, route: '/estadisticas' },
  { name: 'Config', icon: Cog6ToothIcon, route: '/configuracion' }
]

const navigateTo = (route: string) => {
  router.push(route)
}

const isActive = (path: string): boolean => route.path === path
</script>

<template>
  <nav class="flex flex-row justify-center py-4 border-b bg-background">
    <div class="flex flex-row gap-4">
      <button
        v-for="item in navigationLinks"
        :key="item.name"
        @click="navigateTo(item.route)"
        class="flex flex-col items-center justify-center w-[60px] h-[60px] rounded-lg hover:bg-accent transition-colors"
        :class="[isActive(item.route) ? 'bg-accent text-accent-foreground' : 'text-muted-foreground']"
        :title="item.name"
      >
        <component
          :is="item.icon"
          class="w-6 h-6"
        />
        <span class="text-xs mt-1">{{ item.name }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.router-link-active {
  background-color: hsl(var(--accent));
  color: hsl(var(--accent-foreground));
}
</style> 