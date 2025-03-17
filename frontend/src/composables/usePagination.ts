// usePagination.ts - Composable para manejar la paginación de listas
import { ref, computed, watch, type Ref } from 'vue';

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
}

export function usePagination<T>(
  items: Ref<T[]>, 
  options: PaginationOptions = {}
) {
  // Configuración por defecto
  const defaultOptions = {
    initialPage: 1,
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50, 100]
  };
  
  // Combinar opciones predeterminadas con las proporcionadas
  const config = { ...defaultOptions, ...options };
  
  // Estado
  const currentPage = ref(config.initialPage);
  const pageSize = ref(config.initialPageSize);
  
  // Resetear la página actual cuando cambian los elementos
  watch(items, () => {
    currentPage.value = 1;
  });
  
  // Cálculos de paginación
  const totalItems = computed(() => items.value.length);
  
  const totalPages = computed(() => {
    return Math.ceil(totalItems.value / pageSize.value) || 1;
  });
  
  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return items.value.slice(start, end);
  });
  
  const canGoPrev = computed(() => currentPage.value > 1);
  const canGoNext = computed(() => currentPage.value < totalPages.value);
  
  // Método para obtener un rango de páginas para la navegación
  const pageRange = computed(() => {
    const delta = 2; // Cuántas páginas mostrar alrededor de la página actual
    const range = [];
    const rangeWithDots = [];
    
    let l;
    
    // Si solo hay una página, no mostrar navegación
    if (totalPages.value <= 1) return [1];
    
    for (let i = 1; i <= totalPages.value; i++) {
      if (
        i === 1 || 
        i === totalPages.value || 
        i >= currentPage.value - delta && 
        i <= currentPage.value + delta
      ) {
        range.push(i);
      }
    }
    
    // Agregar puntos suspensivos donde sea necesario
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }
    
    return rangeWithDots;
  });
  
  // Acciones
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };
  
  const nextPage = () => {
    if (canGoNext.value) {
      currentPage.value++;
    }
  };
  
  const prevPage = () => {
    if (canGoPrev.value) {
      currentPage.value--;
    }
  };
  
  const setPageSize = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1; // Resetear a la primera página cuando se cambia el tamaño
  };
  
  const firstPage = () => {
    currentPage.value = 1;
  };
  
  const lastPage = () => {
    currentPage.value = totalPages.value;
  };
  
  // Retornar estado y acciones
  return {
    // Estado
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    paginatedItems,
    canGoPrev,
    canGoNext,
    pageRange,
    pageSizeOptions: config.pageSizeOptions,
    
    // Acciones
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    firstPage,
    lastPage
  };
} 