import { createRouter, createWebHistory } from 'vue-router'
import ShadcnDashboard from '../views/ShadcnDashboard.vue'
import Jugadores from '../views/Jugadores.vue'
import Clubes from '../views/Clubes.vue'
import Partidas from '../views/Partidas.vue'
import Estadisticas from '../views/Estadisticas.vue'

// Definición de rutas
const routes = [
  {
    path: '/',
    name: 'home',
    component: ShadcnDashboard // Ahora usamos ShadcnDashboard como la vista principal
  },
  {
    path: '/jugadores',
    name: 'jugadores',
    component: Jugadores
  },
  {
    path: '/jugadores/nuevo',
    name: 'nuevo-jugador',
    component: () => import('../views/NuevoJugador.vue')
  },
  {
    path: '/jugadores/estadisticas',
    name: 'estadisticas-jugadores',
    component: () => import('../views/EstadisticasJugadores.vue')
  },
  {
    path: '/clubes',
    name: 'clubes',
    component: Clubes
  },
  {
    path: '/clubes/nuevo',
    name: 'nuevo-club',
    component: () => import('../views/NuevoClub.vue')
  },
  {
    path: '/clubes/estadisticas',
    name: 'estadisticas-clubes',
    component: () => import('../views/EstadisticasClubes.vue')
  },
  {
    path: '/campeonato',
    name: 'campeonato',
    component: () => import('../views/Campeonato.vue')
  },
  {
    path: '/campeonato/tipo',
    name: 'tipo-campeonato',
    component: () => import('../views/TipoCampeonato.vue')
  },
  {
    path: '/resultados',
    name: 'resultados',
    component: () => import('../views/Resultados.vue')
  },
  {
    path: '/partidas',
    name: 'partidas',
    component: Partidas
  },
  {
    path: '/estadisticas',
    name: 'estadisticas',
    component: Estadisticas
  }
]

// Creación del router
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 