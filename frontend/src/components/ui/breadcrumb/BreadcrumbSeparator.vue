<script setup lang="ts">
// Separador entre elementos de migas de pan
const props = defineProps({
  class: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <li class="mx-1 inline-flex items-center text-gray-400" :class="props.class">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-4 w-4"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  </li>
</template> 