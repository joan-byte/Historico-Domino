<script setup lang="ts">
// Componente principal de la aplicación
</script>

<template>
  <router-view />
</template>

<style lang="postcss">
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Estilos globales para asegurar que el layout ocupe toda la pantalla */
html, body, #app {
  height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
    Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
