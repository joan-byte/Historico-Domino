import { createRouter, createWebHistory } from 'vue-router'
import Clubes from '../views/Clubes.vue'
import Home from '../views/Home.vue'
import ShadcnDashboard from '../views/ShadcnDashboard.vue'
import { h } from 'vue'
import { RouterView } from 'vue-router'

// Definición de rutas
const routes = [
  {
    path: '/',
    component: ShadcnDashboard,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home
      },
      {
        path: '/clubes',
        component: Clubes,
        name: 'ClubesRoot',
      },
      {
        path: '/clubes/crud',
        name: 'CrudClubes',
        component: () => import('../views/CrudClubs.vue')
      },
      {
        path: '/clubes/crear',
        name: 'CrearClub',
        component: () => import('../views/NuevoClub.vue')
      },
      {
        path: '/clubes/modificar/:codigoClub?',
        name: 'ModificarClub',
        component: () => import('../views/ModificarClub.vue'),
        props: true
      },
      {
        path: '/clubes/eliminar/:codigoClub?',
        name: 'EliminarClub',
        component: () => import('../views/EliminarClub.vue'),
        props: true
      },
      {
        path: '/clubes/estadisticas',
        name: 'Estadisticas',
        component: () => import('../views/EstadisticasClubes.vue')
      },
      {
        path: '/clubes/lista',
        name: 'ClubesLista',
        component: Clubes
      },
      
      // Rutas para el módulo de Jugadores
      {
        path: '/jugadores',
        component: () => import('../views/Jugadores.vue'),
        name: 'JugadoresRoot',
      },
      {
        path: '/jugadores/crud',
        name: 'CrudJugadores',
        component: () => import('../views/CrudJugadores.vue')
      },
      {
        path: '/jugadores/crear',
        name: 'CrearJugador',
        component: () => import('../views/NuevoJugador.vue')
      },
      {
        path: '/jugadores/modificar/:idfed',
        name: 'ModificarJugador',
        component: () => import('../views/ModificarJugador.vue'),
        props: true
      },
      {
        path: '/jugadores/estadisticas',
        name: 'EstadisticasJugadores',
        component: () => import('../views/EstadisticasJugadores.vue')
      },
      {
        path: '/jugadores/lista',
        name: 'JugadoresLista',
        component: () => import('../views/Jugadores.vue')
      }
    ]
  }
]

// Creación del router
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes
})

export default router 