# Importamos los modelos para facilitar su acceso
from .base import Base
from .club import Club
from .jugador import Jugador
from .tipo_campeonato import TipoCampeonato
from .resultado import Resultado

# Podemos agregar más imports de otros modelos en el futuro 

__all__ = ['Base', 'Club', 'Jugador', 'TipoCampeonato', 'Resultado'] 