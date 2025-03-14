<script setup lang="ts">
// Barra lateral de la aplicación
import { ref, computed } from 'vue';
import { injectSidebarContext } from '@/components/ui/sidebar/SidebarProvider.vue';
import Separator from '@/components/ui/separator/Separator.vue';
import Button from '@/components/ui/button/Button.vue';

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

// Elementos de navegación
interface NavItem {
  title: string;
  href?: string;
  icon?: string;
  children?: NavItem[];
  isActive?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation = ref<NavSection[]>([
  {
    title: 'Platform',
    items: [
      {
        title: 'Playground',
        href: '#',
        icon: 'M6.5 15.5v-7a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm6 0v-7a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1zm6 0v-7a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1z',
        isActive: true,
        children: [
          { title: 'History', href: '#' },
          { title: 'Starred', href: '#' },
          { title: 'Settings', href: '#' }
        ]
      },
      {
        title: 'Models',
        href: '#',
        icon: 'M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM5 10a5 5 0 0 0-5 5v2h2v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1h2v-2a5 5 0 0 0-5-5h-2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2H5zm12 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-8 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
        children: [
          { title: 'Genesis', href: '#' },
          { title: 'Explorer', href: '#' },
          { title: 'Quantum', href: '#' }
        ]
      },
      {
        title: 'Documentation',
        href: '#',
        icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM14 3v5h5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h8zm-2 8a1 1 0 0 0-1 1v1a1 1 0 0 0 2 0v-1a1 1 0 0 0-1-1zm0 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
        children: [
          { title: 'Introduction', href: '#' },
          { title: 'Get Started', href: '#' },
          { title: 'Tutorials', href: '#' },
          { title: 'Changelog', href: '#' }
        ]
      },
      {
        title: 'Settings',
        href: '#',
        icon: 'M9.954 2.21a9.99 9.99 0 0 1 4.091-.002A3.993 3.993 0 0 0 16 5.07a3.993 3.993 0 0 0 3.457.261A9.99 9.99 0 0 1 21.5 8.876 3.993 3.993 0 0 0 20 12c0 1.264.586 2.391 1.502 3.124a10.043 10.043 0 0 1-2.046 3.543 3.993 3.993 0 0 0-3.456.261 3.993 3.993 0 0 0-1.954 2.86 9.99 9.99 0 0 1-4.091.004A3.993 3.993 0 0 0 8 18.927a3.993 3.993 0 0 0-3.457-.26A9.99 9.99 0 0 1 2.5 15.121 3.993 3.993 0 0 0 4 11.999a3.993 3.993 0 0 0-1.502-3.124 10.043 10.043 0 0 1 2.046-3.543A3.993 3.993 0 0 0 8 5.071a3.993 3.993 0 0 0 1.954-2.86zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
        children: [
          { title: 'General', href: '#' },
          { title: 'Team', href: '#' },
          { title: 'Billing', href: '#' },
          { title: 'Limits', href: '#' }
        ]
      }
    ]
  },
  {
    title: 'Projects',
    items: [
      {
        title: 'Design Engineering',
        href: '#',
        icon: 'M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6zm1 3h10a1 1 0 0 1 0 2H7a1 1 0 1 1 0-2zm0 4h10a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2zm0 4h5a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2z'
      },
      {
        title: 'Sales & Marketing',
        href: '#',
        icon: 'M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-5 8a5 5 0 0 0 10 0h-2a3 3 0 0 1-6 0H7z'
      },
      {
        title: 'Travel',
        href: '#',
        icon: 'M9 2a1 1 0 0 1 .962.725l.035.102L12.074 10h1.852l2.077-7.173a1 1 0 0 1 1.962.376L17.93 3.4 20.613 10H21a1 1 0 0 1 .993.883L22 11v2a3.003 3.003 0 0 1-2 2.83V19a1 1 0 0 1-.883.993L19 20h-6a1 1 0 0 1-.993-.883L12 19v-3.17a3.003 3.003 0 0 1-1.83-2.607L10.167 13H5.835A3.001 3.001 0 0 1 3 11V9a1 1 0 0 1 1-1h2.528l2.077-5.173a1 1 0 0 1 .962-.824L9.64 2H9zm10 10h-4.17A3.001 3.001 0 0 1 12 14.83V18h6v-3.17A3.001 3.001 0 0 1 19 12zm-9.5 0H5v1a1 1 0 0 0 .883.993L6 14h3.5a1 1 0 0 0 .993-.883L10.5 13v-1z'
      }
    ]
  }
]);

// Expandir/colapsar elementos de navegación
const expandedItems = ref<string[]>(['Playground']);

const toggleExpand = (title: string): void => {
  const index = expandedItems.value.indexOf(title);
  if (index === -1) {
    expandedItems.value.push(title);
  } else {
    expandedItems.value.splice(index, 1);
  }
};

const isExpanded = (title: string): boolean => {
  return expandedItems.value.includes(title);
};

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
            <a
              v-else
              :href="item.href"
              class="flex items-center gap-1 rounded-md px-1 py-0.5 text-[9px] text-gray-500 transition-all hover:text-gray-900"
              :class="{ 'bg-gray-100 text-gray-900': item.isActive }"
            >
              <svg v-if="item.icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 shrink-0">
                <path :d="item.icon"></path>
              </svg>
              <span v-if="sidebarContext?.isOpen.value" class="truncate">{{ item.title }}</span>
            </a>
            <!-- Subelementos -->
            <div v-if="item.children && item.children.length > 0 && isExpanded(item.title) && sidebarContext?.isOpen.value" class="mt-0.5 pl-3 space-y-0.5">
              <a v-for="(child, k) in item.children" :key="`child-${k}`" :href="child.href" class="block rounded-md px-1 py-0.5 text-[9px] text-gray-500 transition-all hover:text-gray-900" :class="{ 'bg-gray-100 text-gray-900': child.isActive }">
                {{ child.title }}
              </a>
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