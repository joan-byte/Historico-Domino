<script setup lang="ts">
// Elemento individual de migas de pan
const props = defineProps({
  class: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <li class="inline-flex items-center" :class="props.class">
    <slot></slot>
  </li>
</template> 