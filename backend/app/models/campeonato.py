from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Campeonato(Base):
    """Modelo para la tabla campeonatos"""
    __tablename__ = 'campeonatos'

    # Campos principales
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)
    
    # Relaciones
    tipo_campeonato_id = Column(Integer, ForeignKey('tipos_campeonatos.id'), nullable=False)
    tipo_campeonato = relationship("TipoCampeonato", back_populates="campeonatos")
    
    # Relación con resultados
    resultados = relationship("Resultado", back_populates="campeonato")

    def __repr__(self):
        return f"<Campeonato(id={self.id}, nombre='{self.nombre}')>" 