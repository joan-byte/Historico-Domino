import { ref } from 'vue';

// Interfaces para la navegación
export interface NavItem {
  title: string;
  href?: string;
  icon?: string;
  children?: NavItem[];
  isActive?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/**
 * Composable para gestionar la navegación del dashboard
 * Extrae la lógica de navegación del ShadcnDashboard
 */
export function useNavigation() {
  // Estado para controlar si el sidebar está abierto
  const isOpen = ref(true);
  
  // Elementos de navegación
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
            { title: 'CRUD', href: '/clubes/crud' },
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

  // Función para alternar el estado del sidebar
  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
  };

  // Función para expandir/colapsar elementos de navegación
  const toggleExpand = (title: string): void => {
    const index = expandedItems.value.indexOf(title);
    if (index === -1) {
      expandedItems.value.push(title);
    } else {
      expandedItems.value.splice(index, 1);
    }
  };

  // Función para verificar si un elemento está expandido
  const isExpanded = (title: string): boolean => {
    return expandedItems.value.includes(title);
  };

  // Obtener los hijos de Clubs para las tarjetas superiores
  const getClubsChildren = (): NavItem[] => {
    const clubsItem = navigation.value[0].items.find(item => item.title === 'Clubs');
    return clubsItem?.children || [];
  };

  return {
    isOpen,
    navigation,
    expandedItems,
    toggleSidebar,
    toggleExpand,
    isExpanded,
    getClubsChildren
  };
} 