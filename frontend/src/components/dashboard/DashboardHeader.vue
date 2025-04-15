<script setup lang="ts">
// Componente para la cabecera del dashboard con breadcrumb
import { useNavigation } from '@/composables/useNavigation';

const { toggleSidebar } = useNavigation();
</script>

<template>
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
      
      <!-- Breadcrumb eliminado -->
      <!-- 
      <div class="flex items-center">
        <div class="flex items-center">
          <a href="#" class="text-[11px] text-gray-500 hover:text-gray-900 hidden md:block">Building Your Application</a>
          <span class="mx-1 text-[11px] text-gray-400 hidden md:block">/</span>
          <span class="text-[11px] font-medium">Data Fetching</span>
        </div>
      </div>
      -->
    </div>
  </header>
</template> 