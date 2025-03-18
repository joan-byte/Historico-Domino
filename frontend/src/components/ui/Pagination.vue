<!-- Componente de paginación reutilizable -->
<script setup lang="ts">
interface Props {
  /**
   * Página actual
   */
  currentPage: number;
  
  /**
   * Número total de páginas
   */
  totalPages: number;
  
  /**
   * Si hay una página anterior disponible
   */
  canGoPrev: boolean;
  
  /**
   * Si hay una página siguiente disponible
   */
  canGoNext: boolean;
  
  /**
   * El rango de páginas a mostrar
   */
  pageRange: (number | string)[];
  
  /**
   * Mostrar el selector de tamaño de página
   */
  showPageSizeSelector?: boolean;
  
  /**
   * Opciones de tamaño de página
   */
  pageSizeOptions?: number[];
  
  /**
   * Tamaño de página actual
   */
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  showPageSizeSelector: false,
  pageSizeOptions: () => [5, 10, 20, 50, 100],
  pageSize: 10
});

// Definir los eventos que se emitirán
const emit = defineEmits<{
  'update:currentPage': [page: number];
  'first-page': [];
  'prev-page': [];
  'next-page': [];
  'last-page': [];
  'update:pageSize': [size: number];
}>();

// Métodos para emitir eventos
const goToPage = (page: number) => {
  emit('update:currentPage', page);
};

const goToFirstPage = () => {
  emit('first-page');
};

const goToPrevPage = () => {
  emit('prev-page');
};

const goToNextPage = () => {
  emit('next-page');
};

const goToLastPage = () => {
  emit('last-page');
};

const updatePageSize = (event: Event) => {
  const select = event.target as HTMLSelectElement;
  emit('update:pageSize', parseInt(select.value, 10));
};
</script>

<template>
  <div class="flex items-center justify-between py-4">
    <!-- Selector de tamaño de página -->
    <div v-if="showPageSizeSelector" class="flex items-center">
      <label class="flex items-center text-sm text-gray-700">
        <span class="mr-2">Mostrar</span>
        <select 
          name="page-size-selector"
          :value="pageSize" 
          @change="updatePageSize"
          class="border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 py-1 px-2"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
        <span class="ml-2">elementos</span>
      </label>
    </div>
    <div v-else class="flex-1"></div>
    
    <!-- Navegación de páginas -->
    <div class="flex items-center space-x-2">
      <!-- Botón primera página -->
      <button 
        @click="goToFirstPage" 
        :disabled="!canGoPrev"
        class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        :class="canGoPrev ? 'hover:bg-gray-50' : ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Botón página anterior -->
      <button 
        @click="goToPrevPage" 
        :disabled="!canGoPrev"
        class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        :class="canGoPrev ? 'hover:bg-gray-50' : ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Números de página -->
      <template v-for="(page, index) in pageRange" :key="index">
        <button 
          v-if="typeof page === 'number'" 
          @click="goToPage(page)"
          class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md"
          :class="page === currentPage ? 'bg-black text-white' : 'border border-gray-300 bg-white hover:bg-gray-50'"
        >
          {{ page }}
        </button>
        <span 
          v-else 
          class="px-2 py-1 text-sm text-gray-700"
        >
          {{ page }}
        </span>
      </template>
      
      <!-- Botón página siguiente -->
      <button 
        @click="goToNextPage" 
        :disabled="!canGoNext"
        class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        :class="canGoNext ? 'hover:bg-gray-50' : ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
      
      <!-- Botón última página -->
      <button 
        @click="goToLastPage" 
        :disabled="!canGoNext"
        class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        :class="canGoNext ? 'hover:bg-gray-50' : ''"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          <path fill-rule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style> 