import { createRouter, createWebHistory } from 'vue-router'
import Clubs from '../views/Clubs.vue'
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
        component: Clubs,
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
        component: Clubs
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
      },
      
      // Rutas para el módulo de Campeonatos
      {
        path: '/campeonatos',
        component: () => import('../views/Campeonatos.vue'),
        name: 'CampeonatosRoot',
      },
      {
        path: '/campeonatos/crud',
        name: 'CrudCampeonatos',
        component: () => import('../views/CrudCampeonatos.vue')
      },
      {
        path: '/campeonatos/crear',
        name: 'CrearCampeonato',
        component: () => import('../views/NuevoCampeonato.vue')
      },
      {
        path: '/campeonatos/modificar/:nch',
        name: 'ModificarCampeonato',
        component: () => import('../views/ModificarCampeonato.vue'),
        props: true
      },
      {
        path: '/campeonatos/lista',
        name: 'ListaCampeonatos',
        component: () => import('../views/ListaCampeonatos.vue')
      },
      {
        path: '/campeonatos/estadisticas',
        name: 'EstadisticasCampeonatos',
        component: () => import('../views/EstadisticasCampeonatos.vue')
      },
      {
        path: '/campeonatos/eliminar/:nch',
        name: 'EliminarCampeonato',
        component: () => import('../views/EliminarCampeonato.vue'),
        props: true
      },

      // Rutas para el módulo de Resultados
      {
        path: '/resultados',
        name: 'ResultadosHome',
        component: () => import('../views/ResultadosHome.vue')
      },
      {
        path: '/resultados/lista',
        name: 'ResultadosLista',
        component: () => import('../views/Resultados.vue')
      },
      {
        path: '/resultados/crud',
        name: 'CrudResultados',
        component: () => import('../views/CrudResultados.vue')
      },
      {
        path: '/resultados/nuevo',
        name: 'CrearResultado',
        component: () => import('../views/NuevoResultado.vue')
      },
      {
        path: '/resultados/modificar/:nch/:fecha_campeonato/:idfed_jugador',
        name: 'ModificarResultado',
        component: () => import('../views/ModificarResultado.vue'),
        props: true
      },
      {
        path: '/resultados/estadisticas',
        name: 'EstadisticasResultados',
        component: () => import('../views/EstadisticasResultados.vue')
      },

      // Rutas para el módulo de Settings/Configuración
      {
        path: '/settings',
        component: () => import('../views/Settings.vue'),
        name: 'SettingsRoot',
        children: [
          {
            path: 'tipos-campeonato',
            name: 'TiposCampeonato',
            component: () => import('../views/TipoCampeonato.vue')
          }
        ]
      },

      // Rutas para el módulo de Importar Clubs
      {
        path: '/importar-clubs',
        name: 'ImportarClubs',
        component: () => import('../views/ImportClubsView.vue')
      },
      {
        path: '/importar-jugadores',
        name: 'ImportarJugadores',
        component: () => import('../views/ImportPlayersView.vue')
      },
      // Rutas para el módulo de Importar Resultados
      {
        path: '/resultados/importar',
        name: 'ImportarResultados',
        component: () => import('../views/ImportarResultadosView.vue')
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