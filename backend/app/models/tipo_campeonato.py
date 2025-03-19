from sqlalchemy import Column, Integer, String, CheckConstraint
from sqlalchemy.orm import validates, relationship
from .base import Base

class TipoCampeonato(Base):
    """
    Modelo para la tabla de Tipos de Campeonatos
    """
    __tablename__ = 'tipos_campeonatos'
    
    # Identificador único
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Código del tipo de campeonato (DP, DI, RP, RI, LI)
    codigo = Column(String(2), unique=True, nullable=False)
    
    # Nombre descriptivo del tipo de campeonato
    nombre = Column(String(100), nullable=False)
    
    # Descripción del tipo de campeonato
    descripcion = Column(String(255), nullable=True)
    
    # Relación inversa con Resultado
    resultados = relationship("Resultado", back_populates="tipo_campeonato")
    
    # Relación inversa con Campeonato
    campeonatos = relationship("Campeonato", back_populates="tipo_campeonato")
    
    # Restricciones de formato
    __table_args__ = (
        CheckConstraint("codigo ~ '^[A-Z]{2}$'", name='check_codigo_formato'),
    )
    
    @validates('codigo')
    def validar_codigo(self, key, codigo):
        """
        Valida que el código tenga exactamente 2 letras mayúsculas
        """
        if not codigo.isalpha() or len(codigo) != 2 or not codigo.isupper():
            raise ValueError("El código debe ser exactamente 2 letras mayúsculas")
        return codigo
    
    def __repr__(self):
        """
        Representación string del tipo de campeonato
        """
        return f"<TipoCampeonato {self.codigo} - {self.nombre}>" 