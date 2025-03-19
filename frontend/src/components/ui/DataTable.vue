<!-- Componente de tabla de datos reutilizable con capacidad de ordenación y personalización -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Column {
  field: string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  class?: string;
  // Función para renderizar un cell de forma personalizada
  render?: (item: any) => string;
}

interface Props {
  /**
   * Datos a mostrar en la tabla
   */
  items: any[];
  
  /**
   * Columnas a mostrar
   */
  columns: Column[];
  
  /**
   * Clave única para identificar cada fila
   */
  itemKey: string;
  
  /**
   * Si la tabla muestra bordes
   */
  bordered?: boolean;
  
  /**
   * Si la tabla tiene rayas
   */
  striped?: boolean;
  
  /**
   * Si la tabla es compacta
   */
  compact?: boolean;
  
  /**
   * Si las filas tienen efecto hover
   */
  hover?: boolean;
  
  /**
   * Campo inicialmente ordenado
   */
  initialSortField?: string;
  
  /**
   * Orden inicial (asc o desc)
   */
  initialSortDirection?: 'asc' | 'desc';
}

const props = withDefaults(defineProps<Props>(), {
  bordered: false,
  striped: true,
  compact: false,
  hover: true,
  initialSortField: '',
  initialSortDirection: 'asc'
});

// Emite eventos para acciones sobre la tabla
const emit = defineEmits<{
  'row-click': [item: any];
}>();

// Estado de ordenación
const sortField = ref(props.initialSortField);
const sortDirection = ref<'asc' | 'desc'>(props.initialSortDirection);

// Establecer el campo de ordenación y dirección
const sort = (field: string) => {
  if (sortField.value === field) {
    // Si ya estamos ordenando por este campo, invertir la dirección
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Nuevo campo de ordenación, establecer dirección a asc
    sortField.value = field;
    sortDirection.value = 'asc';
  }
};

// Obtener los datos ordenados
const sortedItems = computed(() => {
  if (!sortField.value) return props.items;
  
  return [...props.items].sort((a, b) => {
    // Obtener los valores a comparar, manejar valores anidados (e.g. 'user.name')
    const getNestedValue = (obj: any, path: string) => {
      return path.split('.').reduce((o, p) => o?.[p], obj);
    };
    
    const valA = getNestedValue(a, sortField.value);
    const valB = getNestedValue(b, sortField.value);
    
    // Realizar la comparación según el tipo de datos
    let comparison = 0;
    
    if (valA === null || valA === undefined) {
      comparison = -1;
    } else if (valB === null || valB === undefined) {
      comparison = 1;
    } else if (typeof valA === 'string' && typeof valB === 'string') {
      comparison = valA.localeCompare(valB);
    } else {
      comparison = valA > valB ? 1 : valA < valB ? -1 : 0;
    }
    
    // Invertir si la dirección es descendente
    return sortDirection.value === 'asc' ? comparison : -comparison;
  });
});

// Manejar el clic en una fila
const onRowClick = (item: any) => {
  emit('row-click', item);
};

// Obtener el valor de una celda
const getCellValue = (item: any, column: Column) => {
  if (column.render) {
    return column.render(item);
  }
  
  // Manejar campos anidados (e.g. 'user.name')
  return column.field.split('.').reduce((o, p) => o?.[p], item);
};

// Clases para la tabla
const tableClasses = computed(() => {
  return {
    'min-w-full': true,
    'divide-y': true,
    'divide-gray-200': true,
    'border': props.bordered,
    'border-gray-200': props.bordered
  };
});

// Clases para las filas
const rowClasses = computed(() => {
  return {
    'hover:bg-gray-50': props.hover
  };
});

// Clases para las celdas
const getCellClasses = (column: Column) => {
  const baseClasses = 'px-6 py-4 whitespace-nowrap';
  const alignClasses = {
    'left': 'text-left',
    'center': 'text-center',
    'right': 'text-right'
  };
  
  return `${baseClasses} ${alignClasses[column.align || 'left']} ${column.class || ''}`;
};

// Determinar si una columna tiene ordenamiento actual
const isSorted = (field: string) => sortField.value === field;

// Obtener el ícono de ordenamiento
const getSortIcon = (field: string) => {
  if (!isSorted(field)) return 'none';
  return sortDirection.value === 'asc' ? 'asc' : 'desc';
};

// Inicializar la ordenación cuando el componente se monta
onMounted(() => {
  if (props.initialSortField) {
    sortField.value = props.initialSortField;
    sortDirection.value = props.initialSortDirection;
  }
});
</script>

<template>
  <div class="overflow-x-auto">
    <table :class="tableClasses">
      <thead class="bg-gray-50">
        <tr>
          <th 
            v-for="column in columns" 
            :key="column.field"
            :class="['px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider', 
                     column.align ? `text-${column.align}` : 'text-left',
                     column.sortable ? 'cursor-pointer' : '']"
            @click="column.sortable ? sort(column.field) : null"
          >
            <div class="flex items-center space-x-1">
              <span>{{ column.header }}</span>
              
              <!-- Indicador de ordenamiento -->
              <span v-if="column.sortable">
                <svg v-if="getSortIcon(column.field) === 'asc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                </svg>
                <svg v-else-if="getSortIcon(column.field) === 'desc'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
                <svg v-else class="w-4 h-4 opacity-0 group-hover:opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                </svg>
              </span>
            </div>
          </th>
          <slot name="header-extra"></slot>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr 
          v-for="item in sortedItems" 
          :key="item[itemKey]"
          :class="rowClasses"
          @click="onRowClick(item)"
        >
          <td 
            v-for="column in columns" 
            :key="`${item[itemKey]}-${column.field}`"
            :class="getCellClasses(column)"
          >
            <!-- Slot personalizado para la celda -->
            <slot :name="`cell-${column.field}`" :item="item" :value="getCellValue(item, column)">
              <template v-if="column.render">
                <div v-html="getCellValue(item, column)" role="button" tabindex="0"></div>
              </template>
              <template v-else>
                {{ getCellValue(item, column) }}
              </template>
            </slot>
          </td>
          
          <!-- Slot para acciones personalizadas por fila -->
          <slot name="row-actions" :item="item"></slot>
        </tr>
        
        <!-- Si no hay datos, mostrar mensaje -->
        <tr v-if="items.length === 0">
          <td :colspan="columns.length + (!!$slots['row-actions'] ? 1 : 0)" class="px-6 py-4 text-center text-gray-500">
            <slot name="empty">
              No hay datos disponibles.
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
.striped tr:nth-child(even) {
  background-color: #f9fafb; /* bg-gray-50 equivalente */
}

.compact th, .compact td {
  padding-left: 0.75rem; /* px-3 equivalente */
  padding-right: 0.75rem;
  padding-top: 0.5rem; /* py-2 equivalente */
  padding-bottom: 0.5rem;
}
</style> 