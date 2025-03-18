import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// Definir la interfaz para el club
interface Club {
  codigo_club: string;
  nombre: string;
  cp?: string;
  numero_club?: string;
  [key: string]: any;
}

// Interfaz para las opciones CRUD
interface CrudOption {
  title: string;
  href: string;
  description: string;
  icon: string;
  color?: string;
}

/**
 * Composable para gestionar la funcionalidad relacionada con clubes
 * Extrae la lógica del componente ShadcnDashboard para mejorar la mantenibilidad
 */
export function useClubsManagement() {
  // Estado para almacenar el club seleccionado desde la vista Clubes
  const selectedClub = ref<Club | null>(null);
  
  // Estado para controlar la vista actual
  const currentView = ref<string>('default');
  
  // Obtener la ruta actual y el router para la navegación
  const route = useRoute();
  const router = useRouter();
  
  // Vigilar los cambios de ruta para actualizar la vista automáticamente
  watch(() => route.path, (newPath) => {
    // Actualizar la vista basada en la ruta actual
    if (newPath === '/') {
      // Para la ruta principal, mostrar las 4 tarjetas de secciones
      currentView.value = 'default';
    } else if (newPath.startsWith('/clubes')) {
      // Para rutas de clubes, mostrar vista crud
      currentView.value = 'crud';
    } else if (newPath.startsWith('/jugadores')) {
      // Para rutas de jugadores, mostrar vista crud
      currentView.value = 'crud';
    } else if (newPath.startsWith('/campeonato')) {
      // Para rutas de campeonatos, mostrar vista crud
      currentView.value = 'crud';
    } else if (newPath.startsWith('/resultados')) {
      // Para rutas de resultados, mostrar vista crud
      currentView.value = 'crud';
    } else {
      // Para otras rutas, mostrar vista por defecto
      currentView.value = 'default';
    }
  }, { immediate: true });
  
  // Al montar el componente, configurar la vista según la ruta actual
  onMounted(() => {
    // Inicializar la vista según la ruta actual
    if (route.path === '/') {
      currentView.value = 'default';
    } else if (route.path.startsWith('/clubes') || 
               route.path.startsWith('/jugadores') || 
               route.path.startsWith('/campeonato') || 
               route.path.startsWith('/resultados')) {
      currentView.value = 'crud';
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
  
  // Función para navegar a la vista de Clubs y actualizar todo
  const navigateToClubs = () => {
    // Resetear la selección de club
    selectedClub.value = null;
    
    // Navegar a la lista de clubes
    router.push('/clubes/lista');
  };
  
  // Función para obtener las opciones CRUD según la sección actual
  const getCrudOptions = (): CrudOption[] => {
    const path = route.path;
    
    // Opciones para Clubes
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
          href: '/jugadores/lista', 
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
    if (path.includes('/campeonato')) {
      return [
        { 
          title: 'CRUD',
          href: '/campeonato/nuevo',
          description: 'Gestionar operaciones CRUD de campeonatos',
          icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
          color: 'bg-amber-100 text-amber-800 border-amber-300'
        },
        { 
          title: 'Lista',
          href: '/campeonato', 
          description: 'Ver todos los campeonatos',
          icon: '<path d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>',
          color: 'bg-orange-100 text-orange-800 border-orange-300'
        },
        { 
          title: 'Estadísticas',
          href: '/campeonato/estadisticas', 
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
          href: '/resultados/nuevo',
          description: 'Gestionar operaciones CRUD de resultados',
          icon: '<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>',
          color: 'bg-purple-100 text-purple-800 border-purple-300'
        },
        { 
          title: 'Lista',
          href: '/resultados', 
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
    
    // Por defecto, mostrar opciones de clubes
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

  // Función para obtener el href dinámico basado en la opción seleccionada
  const getDynamicHref = (option: CrudOption): string => {
    return option.href || '';
  };
  
  // Función para obtener el texto del botón según la opción y la sección actual
  const getButtonText = (option: CrudOption): string => {
    const path = route.path;
    
    if (option.title === 'CRUD') {
      if (path.includes('/clubes')) return 'Gestionar clubs';
      if (path.includes('/jugadores')) return 'Gestionar jugadores';
      if (path.includes('/campeonato')) return 'Gestionar campeonatos';
      if (path.includes('/resultados')) return 'Gestionar resultados';
      return 'Gestionar';
    }
    
    if (option.title === 'Lista') {
      if (path.includes('/clubes')) return 'Ver todos los clubs';
      if (path.includes('/jugadores')) return 'Ver todos los jugadores';
      if (path.includes('/campeonato')) return 'Ver todos los campeonatos';
      if (path.includes('/resultados')) return 'Ver todos los resultados';
      return 'Ver lista';
    }
    
    if (option.title === 'Estadísticas') {
      return 'Ver estadísticas';
    }
    
    return option.title;
  };
  
  return {
    selectedClub,
    currentView,
    navigateToClubs,
    crudOptions: getCrudOptions(),
    getDynamicHref,
    getButtonText,
    handleClubSelected
  };
} 