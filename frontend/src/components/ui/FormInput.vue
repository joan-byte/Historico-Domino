<!-- Componente de entrada de formulario reutilizable -->
<script setup lang="ts">
import { computed } from 'vue';

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
   * Tipo de entrada (text, number, email, password, etc)
   */
  type?: string;
  
  /**
   * Texto de placeholder
   */
  placeholder?: string;
  
  /**
   * Valor del campo
   */
  modelValue: string | number;
  
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
}

// Definir props con valores por defecto
const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  error: '',
  disabled: false,
  helpText: ''
});

// Definir eventos
const emit = defineEmits<{
  'update:modelValue': [value: string | number];
}>();

// Actualizar el valor cuando cambia
const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value: string | number = target.value;
  
  // Convertir a número si el tipo es "number"
  if (props.type === 'number' && value !== '') {
    value = Number(value);
  }
  
  emit('update:modelValue', value);
};

// Determinar si hay error
const hasError = computed(() => props.error !== '');

// Clases para el input
const inputClasses = computed(() => {
  return {
    'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm': true,
    'border-gray-300 focus:ring-black focus:border-black': !hasError.value,
    'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': hasError.value,
    'opacity-50 cursor-not-allowed': props.disabled
  };
});
</script>

<template>
  <div class="mb-4">
    <!-- Etiqueta del campo -->
    <label :for="id" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <!-- Campo de entrada -->
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="inputClasses"
      @input="updateValue"
    />
    
    <!-- Mensaje de error -->
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    
    <!-- Texto de ayuda -->
    <p v-else-if="helpText" class="mt-1 text-sm text-gray-500">{{ helpText }}</p>
  </div>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style> 