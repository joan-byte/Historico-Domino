import { createRouter, createWebHistory } from 'vue-router'
import Clubes from '../views/Clubes.vue'
import Home from '../views/Home.vue'
import DashboardLayout from '../components/dashboard/DashboardLayout.vue'
import { h } from 'vue'
import { RouterView } from 'vue-router'

// Definición de rutas
const routes = [
  {
    path: '/',
    component: DashboardLayout,
    children: [
      {
        path: '',
        redirect: '/clubes'
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