<script setup lang="ts">
// Enlace dentro de un elemento de migas de pan
defineProps({
  href: {
    type: String,
    required: true
  }
});
</script>

<template>
  <a 
    :href="href" 
    class="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
  >
    <slot></slot>
  </a>
</template> 