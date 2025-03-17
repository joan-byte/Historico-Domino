// useClubs.ts - Composable para manejar la lógica de negocio de clubs
import { ref, computed } from 'vue';
import { clubService, type ClubResponse, type ClubCreate } from '../lib/clubService';

export function useClubs() {
  // Estado
  const clubs = ref<ClubResponse[]>([]);
  const selectedClub = ref<ClubResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Acciones
  const fetchClubs = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
      clubs.value = await clubService.getAll();
    } catch (err) {
      console.error('Error al cargar los clubs:', err);
      error.value = 'No se pudieron cargar los clubs. Intente nuevamente más tarde.';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchClubByCode = async (codigo: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      selectedClub.value = await clubService.getByCode(codigo);
    } catch (err) {
      console.error(`Error al cargar el club ${codigo}:`, err);
      error.value = `No se pudo cargar el club ${codigo}. Intente nuevamente más tarde.`;
    } finally {
      isLoading.value = false;
    }
  };

  const createClub = async (clubData: ClubCreate) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const newClub = await clubService.create(clubData);
      clubs.value.push(newClub);
      return newClub;
    } catch (err) {
      console.error('Error al crear el club:', err);
      error.value = 'No se pudo crear el club. Intente nuevamente más tarde.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateClub = async (codigo: string, clubData: Partial<ClubCreate>) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const updatedClub = await clubService.update(codigo, clubData);
      
      // Actualizar el club en la lista si existe
      const index = clubs.value.findIndex(c => c.codigo_club === codigo);
      if (index !== -1) {
        clubs.value[index] = updatedClub;
      }
      
      // Actualizar el club seleccionado si es el mismo
      if (selectedClub.value?.codigo_club === codigo) {
        selectedClub.value = updatedClub;
      }
      
      return updatedClub;
    } catch (err) {
      console.error(`Error al actualizar el club ${codigo}:`, err);
      error.value = `No se pudo actualizar el club ${codigo}. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteClub = async (codigo: string) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      await clubService.delete(codigo);
      
      // Eliminar el club de la lista
      clubs.value = clubs.value.filter(c => c.codigo_club !== codigo);
      
      // Limpiar el club seleccionado si es el mismo
      if (selectedClub.value?.codigo_club === codigo) {
        selectedClub.value = null;
      }
      
      return true;
    } catch (err) {
      console.error(`Error al eliminar el club ${codigo}:`, err);
      error.value = `No se pudo eliminar el club ${codigo}. Intente nuevamente más tarde.`;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Getters
  const sortedClubs = computed(() => 
    [...clubs.value].sort((a, b) => a.nombre.localeCompare(b.nombre))
  );

  // Retornar estado, acciones y getters
  return {
    // Estado
    clubs,
    selectedClub,
    isLoading,
    error,
    
    // Acciones
    fetchClubs,
    fetchClubByCode,
    createClub,
    updateClub,
    deleteClub,
    
    // Getters
    sortedClubs
  };
} 