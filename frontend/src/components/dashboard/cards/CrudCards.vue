<script setup lang="ts">
// Componente para las tarjetas CRUD en el dashboard
import { useClubsManagement } from '@/composables/useClubsManagement';

const { crudOptions, getDynamicHref, selectedClub } = useClubsManagement();
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <!-- Tarjetas para la vista CRUD -->
    <router-link 
      v-for="(option, index) in crudOptions" 
      :key="index" 
      :to="getDynamicHref(option)"
      class="aspect-[3/1] rounded-md border shadow-sm p-3 flex flex-col hover:bg-gray-50 transition-colors"
      :class="option.color"
    >
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-sm font-medium">{{ option.title }}</h3>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
          <g v-html="option.icon"></g>
        </svg>
      </div>
      <div class="text-xs text-gray-600 mb-1">
        {{ option.description }}
      </div>
      <div class="flex justify-between mt-auto">
        <span class="text-xs text-blue-500">
          {{ option.title === 'CRUD' ? 'Gestionar clubs' : 
             option.title === 'Lista' ? 'Ver todos los clubs' : 
             'Ver estadísticas' }}
        </span>
      </div>
    </router-link>
  </div>
</template> 