// main.js - Punto de entrada principal de la aplicación
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Importar estilos globales
import './style.css'

// Crear la aplicación
const app = createApp(App)

// Configurar opciones globales (si es necesario)
app.config.errorHandler = (err, instance, info) => {
  // Manejar errores de forma centralizada
  console.error('Error en la aplicación:', err)
  console.log('Información adicional:', info)
}

// Registrar plugins
app.use(router)

// Montar la aplicación
app.mount('#app')
