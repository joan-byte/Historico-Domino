<script setup lang="ts">
// Componente para las tarjetas de navegación en el dashboard
import { useNavigation, type NavItem } from '@/composables/useNavigation';
import { useClubsManagement } from '@/composables/useClubsManagement';
import { useRouter } from 'vue-router';

const { getClubsChildren } = useNavigation();
const { navigateToClubs, currentView } = useClubsManagement();
const router = useRouter();

// Función para manejar el clic en las tarjetas
const handleCardClick = (child: NavItem) => {
  if (child.title === 'Lista') {
    navigateToClubs();
  } else if (child.title === 'CRUD') {
    currentView.value = 'crud';
  } else {
    router.push(child.href || '');
  }
};
</script>

<template>
  <div class="grid grid-cols-3 gap-4">
    <div 
      v-for="(child, index) in getClubsChildren()" 
      :key="index" 
      class="aspect-[3/1] rounded-md bg-white border shadow-sm p-3 flex flex-col hover:bg-gray-50 transition-colors cursor-pointer"
      @click="handleCardClick(child)"
    >
      <div class="flex items-center justify-between mb-1">
        <h3 class="text-sm font-medium">{{ child.title }}</h3>
        <span class="text-xs text-gray-500">Club</span>
      </div>
      <div class="text-xs text-gray-600 mb-1">
        {{ child.title === 'Lista' ? 'Ver todos los clubs' : 
          (child.title === 'CRUD' ? 'Crear un nuevo club' : 'Estadísticas de clubs') }}
      </div>
      <div class="flex justify-between mt-auto">
        <span class="text-xs text-blue-500">
          {{ child.title === 'Lista' ? 'Ir a la lista de clubs' : 
            (child.title === 'CRUD' ? 'Gestionar clubs' : 'Ver estadísticas') }}
        </span>
      </div>
    </div>
  </div>
</template> 