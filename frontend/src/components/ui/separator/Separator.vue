<script setup lang="ts">
// Componente separador que puede ser horizontal o vertical
const props = defineProps({
  orientation: {
    type: String as () => 'horizontal' | 'vertical',
    default: 'horizontal',
    validator: (value: string) => ['horizontal', 'vertical'].includes(value)
  },
  class: {
    type: String,
    default: ''
  }
});
</script>

<template>
  <div
    class="shrink-0 bg-gray-200"
    :class="{
      'h-[1px] w-full': props.orientation === 'horizontal',
      'h-full w-[1px]': props.orientation === 'vertical',
      [props.class]: !!props.class
    }"
    role="separator"
    :aria-orientation="props.orientation"
  ></div>
</template>
