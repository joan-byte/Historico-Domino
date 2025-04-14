export interface FiltrosResultados {
  tipo_campeonato_id?: number;
  fecha_desde?: string; // Formato YYYY-MM-DD
  fecha_hasta?: string; // Formato YYYY-MM-DD
  idfed_jugador?: string;
}

// Podríamos añadir interfaces para otros filtros aquí si es necesario 