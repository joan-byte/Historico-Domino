from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, CheckConstraint, Float
from sqlalchemy.orm import validates, relationship
from sqlalchemy.ext.hybrid import hybrid_property
from .base import Base

class Resultado(Base):
    """
    Modelo para la tabla de Resultados de campeonatos
    """
    __tablename__ = 'resultados'
    
    # Tipo de campeonato (referencia a la tabla tipos_campeonatos)
    tipo_campeonato_id = Column(Integer, ForeignKey('tipos_campeonatos.id'), nullable=False)
    
    # Número campeonato Histórico (autoincremental)
    nch = Column(Integer, primary_key=True, autoincrement=True)
    
    # Referencia al campeonato
    campeonato_id = Column(Integer, ForeignKey('campeonatos.id'), nullable=True)
    
    # Información del campeonato
    nombre_campeonato = Column(String(200), nullable=False)
    fecha_campeonato = Column(Date, nullable=False, primary_key=True)
    
    # Información del jugador
    idfed_jugador = Column(String(7), ForeignKey('jugadores.idfed'), nullable=False, primary_key=True)
    nombre_jugador = Column(String(100), nullable=False)
    apellido_jugador = Column(String(200), nullable=False)
    codigo_club_jugador = Column(String(6), ForeignKey('clubs.codigo_club'), nullable=False)
    nombre_club_jugador = Column(String(100), nullable=False)
    
    # Información de la pareja (puede ser nula en campeonatos individuales)
    idfed_pareja = Column(String(7), ForeignKey('jugadores.idfed'), nullable=True)
    nombre_pareja = Column(String(100), nullable=True)
    apellido_pareja = Column(String(200), nullable=True)
    codigo_club_pareja = Column(String(6), ForeignKey('clubs.codigo_club'), nullable=True)
    nombre_club_pareja = Column(String(100), nullable=True)
    
    # Información de la partida
    partida = Column(Integer, nullable=False)
    mesa = Column(Integer, nullable=False)
    gb = Column(Boolean, default=True, nullable=False)  # True = A, False = B
    pg = Column(Integer, nullable=False)  # Partida ganada
    dif = Column(Integer, nullable=False)  # Diferencia de puntos
    pv = Column(Integer, nullable=False)  # Puntos válidos
    pt = Column(Integer, nullable=False)  # Puntos totales
    mg = Column(Integer, nullable=False)  # Manos ganadas
    pos = Column(Integer, nullable=False)  # Posición en el ranking
    
    # Relaciones con jugadores y clubs
    jugador = relationship("Jugador", foreign_keys=[idfed_jugador])
    pareja = relationship("Jugador", foreign_keys=[idfed_pareja])
    club_jugador = relationship("Club", foreign_keys=[codigo_club_jugador])
    club_pareja = relationship("Club", foreign_keys=[codigo_club_pareja])
    
    # Relación con tipo de campeonato
    tipo_campeonato = relationship("TipoCampeonato", back_populates="resultados")
    
    # Relación con campeonato
    campeonato = relationship("Campeonato", back_populates="resultados")
    
    # Propiedad híbrida para acceder al código del tipo de campeonato
    @hybrid_property
    def codigo_tipo_campeonato(self):
        """
        Retorna el código del tipo de campeonato
        """
        return self.tipo_campeonato.codigo if self.tipo_campeonato else None
    
    @validates('idfed_jugador', 'idfed_pareja')
    def validar_idfed(self, key, idfed):
        """
        Valida el formato del IDFED si se proporciona
        """
        if idfed is not None:
            if len(idfed) != 7 or not idfed.isdigit():
                raise ValueError("El IDFED debe tener 7 dígitos numéricos")
        return idfed
    
    @validates('codigo_club_jugador', 'codigo_club_pareja')
    def validar_codigo_club(self, key, codigo):
        """
        Valida el formato del código de club si se proporciona
        """
        if codigo is not None:
            if len(codigo) != 6 or not codigo.isdigit():
                raise ValueError("El código del club debe tener 6 dígitos numéricos")
        return codigo
    
    def __repr__(self):
        """
        Representación string del resultado
        """
        tipo_codigo = self.codigo_tipo_campeonato or "?"
        return f"<Resultado {tipo_codigo}-{self.nch} - Jugador: {self.nombre_jugador} {self.apellido_jugador} - Fecha: {self.fecha_campeonato}>" 