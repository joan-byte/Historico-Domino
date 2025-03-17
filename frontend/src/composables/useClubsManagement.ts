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
    if (newPath.startsWith('/clubes')) {
      // Para todas las rutas de clubes, mostrar vista crud
      currentView.value = 'crud';
    } else {
      // Para otras rutas, mostrar vista por defecto
      currentView.value = 'default';
    }
  }, { immediate: true });
  
  // Al montar el componente, configurar la vista según la ruta actual
  onMounted(() => {
    // Inicializar la vista según la ruta actual
    if (route.path.startsWith('/clubes')) {
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
  
  // Opciones CRUD para mostrar en las tarjetas cuando se selecciona CRUD
  const crudOptions: CrudOption[] = [
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
  
  // Función para obtener el href dinámico basado en la opción seleccionada
  const getDynamicHref = (option: CrudOption): string => {
    return option.href || '';
  };
  
  return {
    selectedClub,
    currentView,
    navigateToClubs,
    crudOptions,
    getDynamicHref,
    handleClubSelected
  };
} 