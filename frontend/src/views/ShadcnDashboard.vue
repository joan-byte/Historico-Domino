<script setup lang="ts">
// Vista con diseño de Shadcn
import { ref } from 'vue';

// Información de la empresa
const company = {
  name: 'Historico',
  plan: 'Domino'
};

// Información del usuario
const user = {
  name: 'shadcn',
  email: 'm@example.com',
  avatar: 'https://github.com/shadcn.png'
};

// Estado para controlar si el sidebar está abierto
const isOpen = ref(true);

// Función para alternar el estado del sidebar
const toggleSidebar = () => {
  isOpen.value = !isOpen.value;
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
    title: 'Dashboard',
    items: [
      {
        title: 'Clubs',
        href: '/clubes',
        icon: 'M1 22h22V8l-11-6-11 6v14zm3-2V10l8-4.5 8 4.5v10H4zM15 14h1v4h-1v-4zm-4 0h1v4h-1v-4zm-4 0h1v4H7v-4zm-2 6h14v2H5v-2z',
        isActive: true,
        children: [
          { title: 'CRUD', href: '/clubes/nuevo' },
          { title: 'Lista', href: '/clubes' },
          { title: 'Estadísticas', href: '/clubes/estadisticas' }
        ]
      },
      {
        title: 'Jugadores',
        href: '/jugadores',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        children: [
          { title: 'CRUD', href: '/jugadores/nuevo' },
          { title: 'Lista', href: '/jugadores' },
          { title: 'Estadísticas', href: '/jugadores/estadisticas' }
        ]
      },
      {
        title: 'Campeonatos',
        href: '/campeonato',
        icon: 'M11 2a1 1 0 0 1 2 0h1a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-1.5l1 3H15v2h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1v-2H8.5l1-3H8a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1h2zm2 17v2H9v-2h4zM8 6H6v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6h-2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6h-2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6z',
        children: [
          { title: 'CRUD', href: '/campeonato/nuevo' },
          { title: 'Lista', href: '/campeonato' },
          { title: 'Estadísticas', href: '/campeonato/estadisticas' }
        ]
      },
      {
        title: 'Resultados',
        href: '/resultados',
        icon: 'M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2 2H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z',
        children: [
          { title: 'CRUD', href: '/resultados/nuevo' },
          { title: 'Lista', href: '/resultados' },
          { title: 'Estadísticas', href: '/resultados/estadisticas' }
        ]
      },
      {
        title: 'Settings',
        href: '#',
        icon: 'M9.954 2.21a9.99 9.99 0 0 1 4.091-.002A3.993 3.993 0 0 0 16 5.07a3.993 3.993 0 0 0 3.457.261A9.99 9.99 0 0 1 21.5 8.876 3.993 3.993 0 0 0 20 12c0 1.264.586 2.391 1.502 3.124a10.043 10.043 0 0 1-2.046 3.543 3.993 3.993 0 0 0-3.456.261 3.993 3.993 0 0 0-1.954 2.86 9.99 9.99 0 0 1-4.091.004A3.993 3.993 0 0 0 8 18.927a3.993 3.993 0 0 0-3.457-.26A9.99 9.99 0 0 1 2.5 15.121 3.993 3.993 0 0 0 4 11.999a3.993 3.993 0 0 0-1.502-3.124 10.043 10.043 0 0 1 2.046-3.543A3.993 3.993 0 0 0 8 5.071a3.993 3.993 0 0 0 1.954-2.86zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
        children: [
          { title: 'Tipo de Campeonato', href: '/campeonato' }
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
const expandedItems = ref<string[]>(['Clubs']);

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
</script>

<template>
  <div class="h-screen w-full overflow-hidden">
    <div class="flex h-screen w-full">
      <!-- Sidebar -->
      <div
        class="h-full flex flex-col border-r bg-[#fafafa] transition-all duration-300"
        :class="{ 'w-52': isOpen, 'w-10': !isOpen }"
      >
        <!-- Logo y nombre de la empresa -->
        <div class="flex h-8 items-center border-b px-2">
          <div class="flex items-center gap-1">
            <div class="flex h-5 w-5 items-center justify-center rounded-md bg-black text-white text-[10px] font-medium">
              A
            </div>
            <div v-if="isOpen" class="flex flex-col ml-1">
              <span class="text-[11px] font-medium leading-tight">{{ company.name }}</span>
              <span class="text-[9px] text-gray-500 leading-tight">{{ company.plan }}</span>
            </div>
          </div>
        </div>

        <!-- Navegación -->
        <div class="flex-1 overflow-auto py-2">
          <div v-for="(section, i) in navigation" :key="`section-${i}`" class="px-2 py-1">
            <h3 v-if="isOpen" class="mb-1 px-1 text-[9px] font-semibold text-gray-500">
              {{ section.title }}
            </h3>
            <div class="space-y-1">
              <div v-for="(item, j) in section.items" :key="`item-${j}`">
                <button
                  v-if="item.children && item.children.length > 0"
                  class="flex w-full items-center gap-2 rounded-md px-2 py-1 text-[10px] text-gray-600 transition-all hover:text-gray-900"
                  :class="{ 'bg-gray-100 text-gray-900': item.isActive }"
                  @click="toggleExpand(item.title)"
                >
                  <svg v-if="item.icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0">
                    <path :d="item.icon"></path>
                  </svg>
                  <span v-if="isOpen" class="flex-1 text-left truncate">{{ item.title }}</span>
                  <svg v-if="isOpen" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="ml-auto h-3 w-3" :class="{ 'rotate-180': isExpanded(item.title) }">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                <a
                  v-else
                  :href="item.href"
                  class="flex items-center gap-2 rounded-md px-2 py-1 text-[10px] text-gray-600 transition-all hover:text-gray-900"
                  :class="{ 'bg-gray-100 text-gray-900': item.isActive }"
                >
                  <svg v-if="item.icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0">
                    <path :d="item.icon"></path>
                  </svg>
                  <span v-if="isOpen" class="truncate">{{ item.title }}</span>
                </a>
                <!-- Subelementos -->
                <div v-if="item.children && item.children.length > 0 && isExpanded(item.title) && isOpen" class="mt-1 ml-5 space-y-1">
                  <a v-for="(child, k) in item.children" :key="`child-${k}`" :href="child.href" class="block rounded-md px-2 py-1 text-[10px] text-gray-600 transition-all hover:text-gray-900" :class="{ 'bg-gray-100 text-gray-900': child.isActive }">
                    {{ child.title }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del usuario -->
        <div class="mt-auto border-t p-2">
          <div v-if="isOpen" class="flex items-center gap-2">
            <img :src="user.avatar" alt="Avatar" class="h-5 w-5 rounded-full" />
            <div class="flex flex-col">
              <span class="text-[10px] font-medium leading-tight">{{ user.name }}</span>
              <span class="text-[9px] text-gray-500 leading-tight">{{ user.email }}</span>
            </div>
          </div>
          <div v-else class="flex justify-center">
            <img :src="user.avatar" alt="Avatar" class="h-5 w-5 rounded-full" />
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="flex-1 flex flex-col bg-white overflow-hidden">
        <!-- Header con breadcrumb -->
        <header class="flex h-8 shrink-0 items-center gap-2 border-b px-3 sticky top-0 bg-white z-10">
          <div class="flex items-center gap-2">
            <!-- Botón para alternar el sidebar -->
            <button 
              type="button" 
              class="flex h-5 w-5 items-center justify-center rounded-md text-gray-500 hover:text-gray-900"
              @click="toggleSidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5">
                <path d="M3 9h18M3 15h18M3 5h18M3 19h18"></path>
              </svg>
              <span class="sr-only">Alternar sidebar</span>
            </button>
            
            <!-- Separador vertical -->
            <div class="h-4 w-px bg-gray-200"></div>
            
            <!-- Breadcrumb -->
            <div class="flex items-center">
              <div class="flex items-center">
                <a href="#" class="text-[11px] text-gray-500 hover:text-gray-900 hidden md:block">Building Your Application</a>
                <span class="mx-1 text-[11px] text-gray-400 hidden md:block">/</span>
                <span class="text-[11px] font-medium">Data Fetching</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenido principal -->
        <div class="flex flex-col gap-4 p-4 overflow-auto">
          <!-- Tarjetas en la parte superior -->
          <div class="grid grid-cols-3 gap-4">
            <div class="aspect-[3/1] rounded-md bg-gray-100 shadow-sm"></div>
            <div class="aspect-[3/1] rounded-md bg-gray-100 shadow-sm"></div>
            <div class="aspect-[3/1] rounded-md bg-gray-100 shadow-sm"></div>
          </div>
          
          <!-- Contenido principal -->
          <div class="rounded-md bg-white border shadow-sm p-6 flex-1">
            <div class="max-w-4xl">
              <h2 class="text-lg font-semibold mb-2">Data Fetching</h2>
              <p class="text-sm text-gray-500 mb-4">Fetch data from an API or database in your application.</p>
              
              <div class="prose prose-sm max-w-none">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
                
                <h3 class="text-base font-medium mt-6 mb-2">Getting Started</h3>
                <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
                
                <pre class="bg-gray-900 text-gray-100 rounded-md p-4 my-4 overflow-x-auto"><code>// Example code
fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data));</code></pre>
                
                <h3 class="text-base font-medium mt-6 mb-2">Best Practices</h3>
                <ul class="list-disc pl-5 mb-4">
                  <li>Use a data fetching library like SWR or React Query</li>
                  <li>Implement proper error handling</li>
                  <li>Add loading states for better UX</li>
                  <li>Consider caching strategies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos para asegurar que el layout ocupe toda la pantalla */
.h-screen {
  height: 100vh;
}

/* Ajustes para la prosa */
.prose {
  font-size: 0.875rem;
  line-height: 1.5;
}

.prose p {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose h3 {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose ul {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.prose li {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}

/* Ajustes para el sidebar */
.flex-1 {
  min-height: 0;
}

svg {
  stroke-width: 1.5px;
}

/* Espaciado entre elementos de navegación */
.space-y-1 > :not([hidden]) ~ :not([hidden]) {
  --tw-space-y-reverse: 0;
  margin-top: calc(0.25rem * calc(1 - var(--tw-space-y-reverse)));
  margin-bottom: calc(0.25rem * var(--tw-space-y-reverse));
}
</style> 