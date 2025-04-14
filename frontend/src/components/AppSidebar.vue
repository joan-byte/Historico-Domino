<script setup lang="ts">
// Barra lateral de la aplicación
import { ref, computed } from 'vue';
import { injectSidebarContext } from '@/components/ui/sidebar/SidebarProvider.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Button from '@/components/ui/button/Button.vue';
// Importar el composable de navegación
import { useNavigation } from '@/composables/useNavigation';
// Importar RouterLink para la navegación
import { RouterLink } from 'vue-router';

// Iconos (necesitarás instalar lucide-vue-next)
// import { 
//   AudioWaveform, BookOpen, Bot, Command, Frame, 
//   GalleryVerticalEnd, Map, PieChart, Settings2, SquareTerminal 
// } from 'lucide-vue-next';

// Información de la empresa
const company = {
  name: 'Acme Inc',
  plan: 'Enterprise'
};

// Información del usuario
const user = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: 'https://github.com/shadcn.png'
};

// Usar el composable de navegación
const { navigation, toggleExpand, isExpanded, expandedItems } = useNavigation();

// Contexto del sidebar
const sidebarContext = injectSidebarContext();

// Clases calculadas para el sidebar
const sidebarClasses = computed(() => {
  const isOpen = sidebarContext?.isOpen.value ?? false;
  
  return {
    'w-52': isOpen,
    'w-10': !isOpen
  };
});
</script>

<template>
  <div
    class="h-full flex flex-col border-r bg-white transition-all duration-300"
    :class="sidebarClasses"
  >
    <!-- Logo y nombre de la empresa -->
    <div class="flex h-8 items-center border-b px-2">
      <div class="flex items-center gap-1">
        <div class="flex h-4 w-4 items-center justify-center rounded-md bg-black text-white text-[8px] font-medium">
          A
        </div>
        <div v-if="sidebarContext?.isOpen.value" class="flex flex-col">
          <span class="text-[10px] font-medium">{{ company.name }}</span>
          <span class="text-[8px] text-gray-500">{{ company.plan }}</span>
        </div>
      </div>
    </div>

    <!-- Navegación -->
    <div class="flex-1 overflow-auto py-1">
      <div v-for="(section, i) in navigation" :key="`section-${i}`" class="px-1 py-1">
        <h3 v-if="sidebarContext?.isOpen.value" class="mb-1 px-1 text-[8px] font-semibold text-gray-500">
          {{ section.title }}
        </h3>
        <div class="space-y-0.5">
          <div v-for="(item, j) in section.items" :key="`item-${j}`">
            <button
              v-if="item.children && item.children.length > 0"
              class="flex w-full items-center gap-1 rounded-md px-1 py-0.5 text-[9px] text-gray-500 transition-all hover:text-gray-900"
              :class="{ 'bg-gray-100 text-gray-900': item.isActive }"
              @click="toggleExpand(item.title)"
            >
              <svg v-if="item.icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 shrink-0">
                <path :d="item.icon"></path>
              </svg>
              <span v-if="sidebarContext?.isOpen.value" class="flex-1 text-left truncate">{{ item.title }}</span>
              <svg v-if="sidebarContext?.isOpen.value" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ml-auto h-2 w-2" :class="{ 'rotate-180': isExpanded(item.title) }">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <router-link
              v-else
              :to="item.href"  
              class="flex items-center gap-1 rounded-md px-1 py-0.5 text-[9px] text-gray-500 transition-all hover:text-gray-900"
              :class="{ 'bg-gray-100 text-gray-900': item.isActive }"
              active-class="bg-gray-100 text-gray-900" 
            >
              <svg v-if="item.icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 shrink-0">
                <path :d="item.icon"></path>
              </svg>
              <span v-if="sidebarContext?.isOpen.value" class="truncate">{{ item.title }}</span>
            </router-link>
            <!-- Subelementos -->
            <div v-if="item.children && item.children.length > 0 && isExpanded(item.title) && sidebarContext?.isOpen.value" class="mt-0.5 pl-3 space-y-0.5">
              <router-link v-for="(child, k) in item.children" :key="`child-${k}`" :to="child.href" class="block rounded-md px-1 py-0.5 text-[9px] text-gray-500 transition-all hover:text-gray-900" :class="{ 'bg-gray-100 text-gray-900': child.isActive }" active-class="bg-gray-100 text-gray-900">
                {{ child.title }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Información del usuario -->
    <div class="mt-auto border-t p-1">
      <div v-if="sidebarContext?.isOpen.value" class="flex items-center gap-1">
        <img :src="user.avatar" alt="Avatar" class="h-4 w-4 rounded-full" />
        <div class="flex flex-col">
          <span class="text-[9px] font-medium">{{ user.name }}</span>
          <span class="text-[8px] text-gray-500">{{ user.email }}</span>
        </div>
      </div>
      <div v-else class="flex justify-center">
        <img :src="user.avatar" alt="Avatar" class="h-4 w-4 rounded-full" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para hacer el sidebar más compacto */
.flex-1 {
  min-height: 0;
}

svg {
  stroke-width: 1.5px;
}

/* Reducir el espacio entre elementos */
.space-y-0\.5 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.125rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.125rem * var(--tw-space-y-reverse));
}

/* Hacer que los textos sean más pequeños */
.text-\[8px\] {
  font-size: 8px;
  line-height: 1.1;
}

.text-\[9px\] {
  font-size: 9px;
  line-height: 1.1;
}

.text-\[10px\] {
  font-size: 10px;
  line-height: 1.2;
}
</style> 