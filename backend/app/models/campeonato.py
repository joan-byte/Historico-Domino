from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base import Base
# Importar Club
from .club import Club 
# Importar Sequence si se usa una secuencia de BD para el incremental
# from sqlalchemy import Sequence, event

class Campeonato(Base):
    """Modelo para la tabla campeonatos"""
    __tablename__ = 'campeonatos'

    # --- Clave Primaria ---
    # NCH (Número Campeonato Histórico) - Clave Primaria
    # Formato: [CodigoTipoCampeonato(2)][CodigoClub(6)][FechaInicio(YYYYMMDD)][Incremental(4)]
    # Ejemplo: PA430002202408150001
    # IMPORTANTE: Este campo NO se debe asignar manualmente.
    # Su valor se debe generar AUTOMÁTICAMENTE antes de la inserción 
    # utilizando los códigos del club y tipo de campeonato relacionados,
    # la fecha de inicio y un contador incremental único por club y tipo.
    # Se recomienda usar un listener de evento SQLAlchemy 'before_insert'.
    nch = Column(String(20), primary_key=True, index=True, unique=True)
    
    # --- Campos Principales ---
    nombre = Column(String(100), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    dias = Column(Integer, nullable=False) # Número de días del campeonato
    partidas = Column(Integer, nullable=False) # Número total de partidas
    pm = Column(Integer, nullable=False) # Puntuación Máxima
    gb = Column(Boolean, default=False, nullable=False) # ¿Es Grupo B? (False=A, True=B)
    gbp = Column(Integer, nullable=True) # Partida a partir de la cual empieza el Grupo B (si gb=True)

    # --- Relaciones ---
    # Relación con TipoCampeonato (para obtener CodigoTipoCampeonato)
    tipo_campeonato_id = Column(Integer, ForeignKey('tipos_campeonatos.id'), nullable=False)
    tipo_campeonato = relationship("TipoCampeonato", back_populates="campeonatos")

    # Relación con Club (para obtener CodigoClub)
    # Se relaciona usando el código del club, no el id numérico.
    # Asumiendo tabla 'clubs' con columna 'codigo_club' (String(6), PK o Unique)
    # club_id = Column(Integer, ForeignKey('clubs.id'), nullable=False) # Relación antigua eliminada
    club_codigo = Column(String(6), ForeignKey('clubs.codigo_club'), nullable=False, index=True)
    # club = relationship("Club", back_populates="campeonatos") # Relación antigua
    # Asegúrate que el modelo Club tiene un campo `codigo_club` y `back_populates="campeonatos"`
    club = relationship("Club", foreign_keys=[club_codigo], back_populates="campeonatos") 

    # Relación con Resultados
    resultados = relationship("Resultado", back_populates="campeonato")

    def __repr__(self):
        # Actualizado para mostrar nch como identificador principal
        return f"<Campeonato(nch='{self.nch}', nombre='{self.nombre}')>"

# --- Lógica de generación de NCH (Ejemplo conceptual usando eventos) ---
# from sqlalchemy import event
# from sqlalchemy.orm import Session
# import datetime

# def generar_nch_listener(mapper, connection, target):
#     if target.nch is None:
#         # 1. Obtener códigos (requiere que las relaciones estén cargadas o se carguen)
#         session = Session.object_session(target)
#         if not session:
#             # No se puede generar NCH sin una sesión activa para cargar relaciones
#             # O manejar el caso donde club y tipo_campeonato se asignan directamente
#             # antes de añadir a la sesión.
#             # raise Exception("No se puede generar NCH sin sesión o relaciones asignadas")
#             # Alternativa: Asumir que target.club y target.tipo_campeonato están disponibles
#             if not target.club or not target.tipo_campeonato:
#                  raise Exception("Club y TipoCampeonato deben estar asignados antes de guardar")
#             codigo_tipo = target.tipo_campeonato.codigo # Asume campo 'codigo' en TipoCampeonato
#             codigo_club = target.club.codigo # Asume campo 'codigo' en Club
#         else:
#             # Forzar carga si es necesario (puede ser costoso)
#             # session.refresh(target, ['club', 'tipo_campeonato']) 
#             # O preferiblemente, asegurar que se asignan antes
#             if not target.club or not target.tipo_campeonato:
#                  raise Exception("Club y TipoCampeonato deben estar asignados antes de guardar")
#             codigo_tipo = target.tipo_campeonato.codigo
#             codigo_club = target.club.codigo

#         # 2. Formatear fecha
#         fecha_str = target.fecha_inicio.strftime('%Y%m%d')

#         # 3. Obtener/Incrementar contador (la parte más compleja)
#         #    Esta lógica necesita consultar la BD para el último NCH de este club/tipo
#         #    y calcular el siguiente incremental. Debe ser atómica para evitar concurrencia.
#         #    Podría usarse una tabla separada de contadores o una secuencia de BD específica.
#         #    EJEMPLO MUY SIMPLIFICADO (NO APTO PARA PRODUCCIÓN CONCURRENTE):
#         
#         # Consulta para encontrar el último NCH para este club y tipo
#         # stmt = select(func.max(Campeonato.nch)).where(
#         #     Campeonato.club_id == target.club_id,
#         #     Campeonato.tipo_campeonato_id == target.tipo_campeonato_id
#         # )
#         # last_nch = connection.execute(stmt).scalar_one_or_none()
#         # 
#         # if last_nch:
#         #     last_incremental = int(last_nch[-4:])
#         #     new_incremental = last_incremental + 1
#         # else:
#         #     new_incremental = 1
#         # incremental_str = f"{new_incremental:04d}"
#         # 
#         # Placeholder - Sustituir con lógica robusta
#         incremental_str = "0001" # ¡¡¡ IMPLEMENTAR LÓGICA REAL AQUÍ !!!

#         # 4. Ensamblar NCH
#         target.nch = f"{codigo_tipo}{codigo_club}{fecha_str}{incremental_str}

# Registrar el listener para que se ejecute antes de insertar un Campeonato
# event.listen(Campeonato, 'before_insert', generar_nch_listener) 