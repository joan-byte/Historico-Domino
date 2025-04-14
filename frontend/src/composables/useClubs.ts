// useClubs.ts - Composable para manejar la lógica de negocio de clubs
import { ref, computed } from 'vue';
// Importar tipos actualizados
import { clubService, type ClubResponse, type ClubCreate, type ClubUpdate, type ClubsPaginados } from '../lib/clubService';

export function useClubs() {
  // Estado
  const clubs = ref<ClubResponse[]>([]); // Página actual
  const totalClubs = ref(0); // Total para paginación
  const selectedClub = ref<ClubResponse | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Acciones
  // Adaptar fetchClubs
  const fetchClubs = async (skip: number = 0, limit: number = 100) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response: ClubsPaginados = await clubService.getAll(skip, limit);
      clubs.value = response.clubs;
      totalClubs.value = response.total;
    } catch (err) {
      console.error('Error al cargar los clubs:', err);
      error.value = 'No se pudieron cargar los clubs. Intente nuevamente más tarde.';
      clubs.value = [];
      totalClubs.value = 0;
    } finally {
      isLoading.value = false;
    }
  };

  // fetchClubByCode no necesita cambios para paginación
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

  // Create, Update, Delete requieren refetch
  const createClub = async (clubData: ClubCreate) => {
    isLoading.value = true;
    error.value = null;
    try {
      const newClub = await clubService.create(clubData);
      // No actualizar lista local, la vista hará refetch
      return newClub;
    } catch (err) {
      console.error('Error al crear el club:', err);
      error.value = 'No se pudo crear el club. Intente nuevamente más tarde.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Usar ClubUpdate
  const updateClub = async (codigo: string, clubData: ClubUpdate) => {
    isLoading.value = true;
    error.value = null;
    try {
      const updatedClub = await clubService.update(codigo, clubData);
      // No actualizar lista local
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
      // No actualizar lista local
      if (selectedClub.value?.codigo_club === codigo) {
        selectedClub.value = null;
      }
      return true;
    } catch (err) {
      console.error(`Error al eliminar el club ${codigo}:`, err);
      // Manejar error específico de jugadores asociados
      if (err instanceof Error && err.message.includes("jugadores asociados")) {
           error.value = "No se puede eliminar el club porque tiene jugadores asociados. Elimine o reasigne los jugadores primero.";
      } else {
          error.value = `No se pudo eliminar el club ${codigo}. Intente nuevamente más tarde.`;
      }
      throw err; // Relanzar para que la vista pueda saber que falló
    } finally {
      isLoading.value = false;
    }
  };

  // Eliminar sortedClubs
  // const sortedClubs = computed(() => 
  //   [...clubs.value].sort((a, b) => a.nombre.localeCompare(b.nombre))
  // );

  // Retornar estado, acciones y getters
  return {
    // Estado
    clubs,
    totalClubs,
    selectedClub,
    isLoading,
    error,
    
    // Acciones
    fetchClubs,
    fetchClubByCode,
    createClub,
    updateClub,
    deleteClub,
    
    // Getters (eliminado sortedClubs)
  };
} 