<!-- Componente de selección de formulario reutilizable -->
<script setup lang="ts">
import { computed } from 'vue';

interface Option {
  value: string | number;
  label: string;
}

interface Props {
  /**
   * ID del campo
   */
  id: string;
  
  /**
   * Etiqueta del campo
   */
  label: string;
  
  /**
   * Valor del campo
   */
  modelValue: string | number;
  
  /**
   * Opciones del select
   */
  options: Option[];
  
  /**
   * Si es un campo requerido
   */
  required?: boolean;
  
  /**
   * Mensaje de error
   */
  error?: string;
  
  /**
   * Si el campo está deshabilitado
   */
  disabled?: boolean;
  
  /**
   * Texto de ayuda
   */
  helpText?: string;
  
  /**
   * Texto para la opción por defecto (primer elemento)
   */
  placeholder?: string;
}

// Definir props con valores por defecto
const props = withDefaults(defineProps<Props>(), {
  required: false,
  error: '',
  disabled: false,
  helpText: '',
  placeholder: 'Seleccione una opción'
});

// Definir eventos
const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

// Actualizar el valor cuando cambia
const updateValue = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  let value = target.value;
  
  // Si es un número, convertirlo
  if (!isNaN(Number(value)) && value !== '') {
    value = Number(value).toString();
  }
  
  emit('update:modelValue', value);
};

// Determinar si hay error
const hasError = computed(() => props.error !== '');

// Clases para el select
const selectClasses = computed(() => {
  return {
    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm': true,
    'border-gray-300 focus:ring-black focus:border-black': !hasError.value,
    'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500': hasError.value,
    'opacity-50 cursor-not-allowed': props.disabled
  };
});
</script>

<template>
  <div class="mb-4">
    <!-- Etiqueta del campo con el select anidado -->
    <label class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
      
      <!-- Campo de selección -->
      <select
        :value="modelValue"
        :required="required"
        :disabled="disabled"
        :class="[selectClasses, 'mt-1']"
        @change="updateValue"
        class="w-full"
      >
        <!-- Opción placeholder -->
        <option value="" disabled>{{ placeholder }}</option>
        
        <!-- Opciones del select -->
        <option 
          v-for="option in options" 
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </label>
    
    <!-- Mensaje de error -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    
    <!-- Texto de ayuda -->
    <p v-else-if="helpText" class="mt-1 text-sm text-gray-500">{{ helpText }}</p>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style> 