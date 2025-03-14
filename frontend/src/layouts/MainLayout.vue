<script setup lang="ts">
// Layout principal sin barra de navegación
</script>

<template>
  <div class="min-h-screen">
    <!-- Main Content -->
    <main class="h-screen overflow-hidden">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* Asegurar que el contenido se ajuste a la pantalla */
.h-screen {
  height: 100vh;
}

.min-h-screen {
  min-height: 100vh;
}
</style> 