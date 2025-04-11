<script setup lang="ts">
// Vista con diseño de Shadcn
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Definir la interfaz para el club
interface Club {
  codigo_club: string;
  nombre: string;
  cp?: string;
  numero_club?: string;
  [key: string]: any;
}

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

// Estado para almacenar el club seleccionado desde la vista Clubes
const selectedClub = ref<Club | null>(null);

// Obtener la ruta actual y el router para la navegación
const route = useRoute();
const router = useRouter();

// Estado para controlar la vista actual
const currentView = ref<string>('default');

// Expandir/colapsar elementos de navegación
const expandedItems = ref<string[]>([]);

// Vigilar los cambios de ruta para actualizar la vista automáticamente
watch(() => route.path, (newPath) => {
  if (newPath === '/') {
    // En la ruta principal, mostrar las tarjetas principales
    currentView.value = 'default';
    expandedItems.value = [];
  } else if (newPath.includes('/clubes/') || newPath === '/clubes') {
    // Si estamos en rutas relacionadas con clubes, mantener las tarjetas CRUD
    currentView.value = 'crud';
  } else if (newPath.includes('/jugadores/') || newPath === '/jugadores') {
    // Si estamos en rutas relacionadas con jugadores, mostrar la vista de CRUD
    currentView.value = 'crud';
  } else if (newPath.includes('/campeonatos/') || newPath === '/campeonatos') {
    // Si estamos en rutas relacionadas con campeonatos, mostrar la vista de CRUD
    currentView.value = 'crud';
  } else if (newPath.includes('/resultados/') || newPath === '/resultados') {
    // Si estamos en rutas relacionadas con resultados, mostrar la vista de CRUD
    currentView.value = 'crud';
  } else {
    // Para otras rutas, mostrar la vista predeterminada
    currentView.value = 'default';
  }
}, { immediate: true });

// Al montar el componente, configurar la vista según la ruta actual
onMounted(() => {
  // Inicializar la vista según la ruta actual
  if (route.path === '/clubes' || route.path.includes('/clubes/') ||
      route.path === '/jugadores' || route.path.includes('/jugadores/') ||
      route.path === '/campeonatos' || route.path.includes('/campeonatos/') ||
      route.path === '/resultados' || route.path.includes('/resultados/')) {
    currentView.value = 'crud';
  } else {
    currentView.value = 'default';
  }

  // Escuchar el evento personalizado cuando se selecciona un club
  window.addEventListener('club-selected', handleClubSelected);
});

// Limpiar los event listeners al desmontar
onUnmounted(() => {
  window.removeEventListener('club-selected', handleClubSelected);
});

// Función para manejar el evento de selección de club
const handleClubSelected = (event: Event) => {
  const customEvent = event as CustomEvent;
  selectedClub.value = customEvent.detail as Club | null;
};

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
    title: 'Gestion',
    items: [
      {
        title: 'Clubs',
        href: '/clubes',
        icon: 'M1 22h22V8l-11-6-11 6v14zm3-2V10l8-4.5 8 4.5v10H4zM15 14h1v4h-1v-4zm-4 0h1v4h-1v-4zm-4 0h1v4H7v-4zm-2 6h14v2H5v-2z',
        isActive: true,
        children: [
          { title: 'CRUD', href: '/clubes/crud' },
          { title: 'Lista', href: '/clubes/lista' },
          { title: 'Estadísticas', href: '/clubes/estadisticas' }
        ]
      },
      {
        title: 'Jugadores',
        href: '/jugadores',
        icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
        children: [
          { title: 'CRUD', href: '/jugadores/crud' },
          { title: 'Lista', href: '/jugadores' },
          { title: 'Estadísticas', href: '/jugadores/estadisticas' }
        ]
      },
      {
        title: 'Campeonatos',
        href: '/campeonatos',
        icon: 'M11 2a1 1 0 0 1 2 0h1a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-1.5l1 3H15v2h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1v-2H8.5l1-3H8a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1h2zm2 17v2H9v-2h4zM8 6H6v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6h-2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6h-2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6z',
        children: [
          { title: 'CRUD', href: '/campeonatos/crud' },
          { title: 'Lista', href: '/campeonatos/lista' },
          { title: 'Estadísticas', href: '/campeonatos/estadisticas' }
        ]
      },
      {
        title: 'Resultados',
        href: '/resultados',
        icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
        children: [
          { title: 'CRUD', href: '/resultados/crud' },
          { title: 'Lista', href: '/resultados/lista' },
          { title: 'Estadísticas', href: '/resultados/estadisticas' }
        ]
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: 'M9.954 2.21a9.99 9.99 0 0 1 4.091-.002A3.993 3.993 0 0 0 16 5.07a3.993 3.993 0 0 0 3.457.261A9.99 9.99 0 0 1 21.5 8.876 3.993 3.993 0 0 0 20 12c0 1.264.586 2.391 1.502 3.124a10.043 10.043 0 0 1-2.046 3.543 3.993 3.993 0 0 0-3.456.261 3.993 3.993 0 0 0-1.954 2.86 9.99 9.99 0 0 1-4.091.004A3.993 3.993 0 0 0 8 18.927a3.993 3.993 0 0 0-3.457-.26A9.99 9.99 0 0 1 2.5 15.121 3.993 3.993 0 0 0 4 11.999a3.993 3.993 0 0 0-1.502-3.124 10.043 10.043 0 0 1 2.046-3.543A3.993 3.993 0 0 0 8 5.071a3.993 3.993 0 0 0 1.954-2.86zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
        children: [
          { title: 'Tipos de Campeonato', href: '/settings/tipos-campeonato' }
        ]
      }
    ]
  },
  {
    title: 'Herramientas',
    items: [
      {
        title: 'Importaciones',
        href: '#',
        icon: 'M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6zm1 3h10a1 1 0 0 1 0 2H7a1 1 0 1 1 0-2zm0 4h10a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2zm0 4h5a1 1 0 0 1 0 2H7a1 1 0 0 1 0-2z',
        children: []
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

// Modificar la función toggleExpand para no manejar el clic en Clubs
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

// Obtener los hijos de Clubs para las tarjetas superiores
const getClubsChildren = (): NavItem[] => {
  const clubsItem = navigation.value[0].items.find(item => item.title === 'Clubs');
  return clubsItem?.children || [];
};

// Función para manejar el clic en los elementos del sidebar
const handleSidebarItemClick = (item: NavItem): void => {
  // Navegar directamente a la ruta del elemento
  if (item.href) {
    router.push(item.href);
    
    // Actualizar la vista según la ruta
    if (item.href.includes('/clubes/')) {
      currentView.value = 'crud';
    } else {
      currentView.value = 'default';
    }
  }
};

// Función para manejar el clic en las tarjetas principales
const handleMainCardClick = (route: string): void => {
  // Expandir el elemento correspondiente en el sidebar
  if (route.includes('/clubes')) {
    if (!isExpanded('Clubs')) {
      toggleExpand('Clubs');
    }
  } else if (route.includes('/jugadores')) {
    if (!isExpanded('Jugadores')) {
      toggleExpand('Jugadores');
    }
  } else if (route.includes('/campeonatos')) {
    if (!isExpanded('Campeonatos')) {
      toggleExpand('Campeonatos');
    }
  } else if (route.includes('/resultados')) {
    if (!isExpanded('Resultados')) {
      toggleExpand('Resultados');
    }
  }
  
  // Navegar a la ruta
  router.push(route);
  
  // Actualizar la vista según la ruta
  if (route.includes('/clubes') || route.includes('/jugadores') || route.includes('/campeonatos')) {
    currentView.value = 'crud';
  } else {
    currentView.value = 'default';
  }
};

// Opciones CRUD dinámicas según la sección activa
const getCrudOptions = () => {
  const path = route.path;
  
  // Opciones para Clubs
  if (path.includes('/clubes')) {
    return [
      { 
        title: 'CRUD',
        href: '/clubes/crud',
        description: 'Gestionar operaciones CRUD de clubs',
        icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
        color: 'bg-green-100 text-green-800 border-green-300'
      },
      { 
        title: 'Lista',
        href: '/clubes/lista', 
        description: 'Ver todos los clubs registrados',
        icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
        color: 'bg-blue-100 text-blue-800 border-blue-300'
      },
      { 
        title: 'Estadísticas',
        href: '/clubes/estadisticas', 
        description: 'Ver métricas y estadísticas de clubs',
        icon: '<path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z"></path>',
        color: 'bg-purple-100 text-purple-800 border-purple-300'
      }
    ];
  }
  
  // Opciones para Jugadores
  if (path.includes('/jugadores')) {
    return [
      { 
        title: 'CRUD',
        href: '/jugadores/crud',
        description: 'Gestionar operaciones CRUD de jugadores',
        icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
        color: 'bg-blue-100 text-blue-800 border-blue-300'
      },
      { 
        title: 'Lista',
        href: '/jugadores', 
        description: 'Ver todos los jugadores registrados',
        icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
        color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
      },
      { 
        title: 'Estadísticas',
        href: '/jugadores/estadisticas', 
        description: 'Ver métricas y estadísticas de jugadores',
        icon: '<path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z"></path>',
        color: 'bg-purple-100 text-purple-800 border-purple-300'
      }
    ];
  }
  
  // Opciones para Campeonatos
  if (path.includes('/campeonatos')) {
    return [
      { 
        title: 'CRUD',
        href: '/campeonatos/crud',
        description: 'Gestionar operaciones CRUD de campeonatos',
        icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
        color: 'bg-amber-100 text-amber-800 border-amber-300'
      },
      { 
        title: 'Lista',
        href: '/campeonatos/lista', 
        description: 'Ver todos los campeonatos',
        icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
        color: 'bg-orange-100 text-orange-800 border-orange-300'
      },
      { 
        title: 'Estadísticas',
        href: '/campeonatos/estadisticas', 
        description: 'Ver métricas y estadísticas de campeonatos',
        icon: '<path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z"></path>',
        color: 'bg-red-100 text-red-800 border-red-300'
      }
    ];
  }
  
  // Opciones para Resultados
  if (path.includes('/resultados')) {
    return [
      { 
        title: 'CRUD',
        href: '/resultados/crud',
        description: 'Gestionar operaciones CRUD de resultados',
        icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
        color: 'bg-purple-100 text-purple-800 border-purple-300'
      },
      { 
        title: 'Lista',
        href: '/resultados/lista', 
        description: 'Ver todos los resultados registrados',
        icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
        color: 'bg-violet-100 text-violet-800 border-violet-300'
      },
      { 
        title: 'Estadísticas',
        href: '/resultados/estadisticas', 
        description: 'Ver métricas y estadísticas de resultados',
        icon: '<path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z"></path>',
        color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300'
      }
    ];
  }
  
  // Por defecto, mostrar opciones para Clubs
  return [
    { 
      title: 'CRUD',
      href: '/clubes/crud',
      description: 'Gestionar operaciones CRUD de clubs',
      icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
      color: 'bg-green-100 text-green-800 border-green-300'
    },
    { 
      title: 'Lista',
      href: '/clubes/lista', 
      description: 'Ver todos los clubs registrados',
      icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
      color: 'bg-blue-100 text-blue-800 border-blue-300'
    },
    { 
      title: 'Estadísticas',
      href: '/clubes/estadisticas', 
      description: 'Ver métricas y estadísticas de clubs',
      icon: '<path d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16h16V4H4z"></path>',
      color: 'bg-purple-100 text-purple-800 border-purple-300'
    }
  ];
};

// Referencia reactiva para las opciones CRUD
const crudOptions = computed(() => {
  return getCrudOptions();
});

// Función para obtener etiquetas dinámicas para los botones de las tarjetas CRUD
const getCardButtonLabel = (option: any) => {
  const path = route.path;
  
  if (option.title === 'CRUD') {
    if (path.includes('/clubes')) return 'Gestionar clubs';
    if (path.includes('/jugadores')) return 'Gestionar jugadores';
    if (path.includes('/campeonatos')) return 'Gestionar campeonatos';
    if (path.includes('/resultados')) return 'Gestionar resultados';
    return 'Gestionar';
  }
  
  if (option.title === 'Lista') {
    if (path.includes('/clubes')) return 'Ver todos los clubs';
    if (path.includes('/jugadores')) return 'Ver todos los jugadores';
    if (path.includes('/campeonatos')) return 'Ver todos los campeonatos';
    if (path.includes('/resultados')) return 'Ver todos los resultados';
    return 'Ver lista';
  }
  
  if (option.title === 'Estadísticas') {
    return 'Ver estadísticas';
  }
  
  return option.title;
};

// Función para obtener el href dinámico basado en la opción seleccionada
const getDynamicHref = (option: any): string => {
  return option.href || '';
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
            <div class="flex h-5 w-5 items-center justify-center rounded-md bg-white border border-gray-300 text-[10px] font-medium overflow-hidden">
              <!-- Ficha de dominó estilizada (6-6) -->
              <svg viewBox="0 0 24 36" width="12" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Borde de la ficha -->
                <rect x="2" y="2" width="20" height="32" rx="3" fill="none" stroke="black" stroke-width="1.5" />
                
                <!-- Línea divisoria horizontal -->
                <line x1="2" y1="18" x2="22" y2="18" stroke="black" stroke-width="1" />
                
                <!-- Puntos - Lado superior (6 puntos en 2 columnas) -->
                <circle cx="7.5" cy="6" r="1.2" fill="black" />
                <circle cx="7.5" cy="11" r="1.2" fill="black" />
                <circle cx="7.5" cy="16" r="1.2" fill="black" />
                
                <circle cx="16.5" cy="6" r="1.2" fill="black" />
                <circle cx="16.5" cy="11" r="1.2" fill="black" />
                <circle cx="16.5" cy="16" r="1.2" fill="black" />
                
                <!-- Puntos - Lado inferior (6 puntos en 2 columnas) -->
                <circle cx="7.5" cy="20" r="1.2" fill="black" />
                <circle cx="7.5" cy="25" r="1.2" fill="black" />
                <circle cx="7.5" cy="30" r="1.2" fill="black" />
                
                <circle cx="16.5" cy="20" r="1.2" fill="black" />
                <circle cx="16.5" cy="25" r="1.2" fill="black" />
                <circle cx="16.5" cy="30" r="1.2" fill="black" />
              </svg>
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
                <router-link
                  v-else
                  :to="item.href || ''"
                  class="flex items-center gap-2 rounded-md px-2 py-1 text-[10px] text-gray-600 transition-all hover:text-gray-900"
                  :class="{ 'bg-gray-100 text-gray-900': item.isActive }"
                >
                  <svg v-if="item.icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5 shrink-0">
                    <path :d="item.icon"></path>
                  </svg>
                  <span v-if="isOpen" class="truncate">{{ item.title }}</span>
                </router-link>
                <!-- Subelementos -->
                <div v-if="item.children && item.children.length > 0 && isExpanded(item.title) && isOpen" class="mt-1 ml-5 space-y-1">
                  <router-link 
                    v-for="(child, k) in item.children" 
                    :key="`child-${k}`" 
                    :to="child.href || ''" 
                    class="block rounded-md px-2 py-1 text-[10px] text-gray-600 transition-all hover:text-gray-900" 
                    :class="{ 'bg-gray-100 text-gray-900': child.isActive }"
                    @click="handleSidebarItemClick(child)"
                  >
                    {{ child.title }}
                  </router-link>
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
          <!-- Tarjetas en la parte superior - Se muestran en todas las vistas -->
          <div class="grid grid-cols-5 gap-4">
            <!-- Tarjeta de Inicio -->
            <div 
              class="aspect-[3/2] rounded-md bg-gray-50 border border-gray-200 shadow-sm p-3 flex flex-col hover:bg-gray-100 transition-colors cursor-pointer"
              @click="handleMainCardClick('/')"
            >
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-sm font-medium text-gray-800">Inicio</h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-gray-600">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div class="text-xs text-gray-700 mb-2">
                Página principal del sistema
              </div>
              <div class="flex justify-between mt-auto">
                <span class="text-xs text-gray-600 hover:underline">
                  Volver al inicio
                </span>
              </div>
            </div>
            
            <div 
              class="aspect-[3/2] rounded-md bg-green-50 border border-green-200 shadow-sm p-3 flex flex-col hover:bg-green-100 transition-colors cursor-pointer"
              @click="handleMainCardClick('/clubes')"
            >
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-sm font-medium text-green-800">Clubs</h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-green-600">
                  <path d="M1 22h22V8l-11-6-11 6v14zm3-2V10l8-4.5 8 4.5v10H4zM15 14h1v4h-1v-4zm-4 0h1v4h-1v-4zm-4 0h1v4H7v-4zm-2 6h14v2H5v-2z"></path>
                </svg>
              </div>
              <div class="text-xs text-green-700 mb-2">
                Gestión de clubs y entidades
              </div>
              <div class="flex justify-between mt-auto">
                <span class="text-xs text-green-600 hover:underline">
                  Acceder a Clubs
                </span>
              </div>
            </div>
            
            <div 
              class="aspect-[3/2] rounded-md bg-blue-50 border border-blue-200 shadow-sm p-3 flex flex-col hover:bg-blue-100 transition-colors cursor-pointer"
              @click="handleMainCardClick('/jugadores')"
            >
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-sm font-medium text-blue-800">Jugadores</h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-blue-600">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div class="text-xs text-blue-700 mb-2">
                Gestión de jugadores y licencias
              </div>
              <div class="flex justify-between mt-auto">
                <span class="text-xs text-blue-600 hover:underline">
                  Acceder a Jugadores
                </span>
              </div>
            </div>
            
            <div 
              class="aspect-[3/2] rounded-md bg-amber-50 border border-amber-200 shadow-sm p-3 flex flex-col hover:bg-amber-100 transition-colors cursor-pointer"
              @click="handleMainCardClick('/campeonatos')"
            >
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-sm font-medium text-amber-800">Campeonatos</h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-amber-600">
                  <path d="M11 2a1 1 0 0 1 2 0h1a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v2a4 4 0 0 1-4 4h-1.5l1 3H15v2h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1v-2H8.5l1-3H8a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1h2zm2 17v2H9v-2h4zM8 6H6v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6h-2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6h-2v1a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6z"></path>
                </svg>
              </div>
              <div class="text-xs text-amber-700 mb-2">
                Gestión de torneos y campeonatos
              </div>
              <div class="flex justify-between mt-auto">
                <span class="text-xs text-amber-600 hover:underline">
                  Acceder a Campeonatos
                </span>
              </div>
            </div>
            
            <div 
              class="aspect-[3/2] rounded-md bg-purple-50 border border-purple-200 shadow-sm p-3 flex flex-col hover:bg-purple-100 transition-colors cursor-pointer"
              @click="handleMainCardClick('/resultados')"
            >
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-sm font-medium text-purple-800">Resultados</h3>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 text-purple-600">
                  <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2 2H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"></path>
                </svg>
              </div>
              <div class="text-xs text-purple-700 mb-2">
                Registro y análisis de resultados
              </div>
              <div class="flex justify-between mt-auto">
                <span class="text-xs text-purple-600 hover:underline">
                  Acceder a Resultados
                </span>
              </div>
            </div>
          </div>
          
          <!-- Contenido del router-view -->
          <div class="rounded-md bg-white border shadow-sm p-6 flex-1">
            <div v-if="route.path === '/'" class="flex flex-col items-center justify-center h-full">
              <h1 class="text-2xl font-bold text-gray-800 mb-4">Bienvenidos a la gestión del histórico</h1>
              <p class="text-lg text-gray-600 text-center mb-6">
                Sistema centralizado para la gestión de Clubs, Jugadores, Campeonatos y Resultados
              </p>
            </div>
            <router-view v-else :key="route.fullPath" />
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