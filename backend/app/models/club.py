from sqlalchemy import Column, Integer, String, CheckConstraint
from sqlalchemy.orm import validates, relationship
from .base import Base

class Club(Base):
    """
    Modelo para la tabla de Clubs
    """
    __tablename__ = 'clubs'
    
    # Identificador único automático
    id = Column(Integer, primary_key=True)
    
    # Código Postal (primeras dos cifras)
    cp = Column(String(2), nullable=False)
    
    # Número asignado por el usuario
    numero_club = Column('numero_usuario', String(4), nullable=False)  # Mapeado a 'numero_usuario' en la BD
    
    # Clave única compuesta por CP + número de club
    codigo_club = Column(String(6), unique=True, nullable=False)
    
    # Nombre del club
    nombre = Column(String(100), nullable=False)
    
    # Restricción para asegurar que CP solo contenga números y sea de 2 dígitos
    __table_args__ = (
        CheckConstraint("cp ~ '^[0-9]{2}$'", name='check_cp_formato'),
    )
    
    # Relación inversa con Jugador
    jugadores = relationship("Jugador", back_populates="club")
    
    @validates('cp')
    def validar_cp(self, key, cp):
        """
        Valida que el CP tenga exactamente 2 dígitos
        """
        if not cp.isdigit() or len(cp) != 2:
            raise ValueError("El CP debe ser exactamente 2 dígitos numéricos")
        return cp
    
    @validates('numero_club')
    def validar_numero_club(self, key, numero):
        """
        Valida que el número de club sea numérico y tenga máximo 4 dígitos
        """
        if not numero.isdigit() or len(numero) > 4:
            raise ValueError("El número debe ser numérico y tener máximo 4 dígitos")
        return numero
    
    @validates('codigo_club')
    def validar_codigo_club(self, key, codigo):
        """
        Asegura que el código del club sea la concatenación de CP y número de club
        """
        if codigo != f"{self.cp}{self.numero_club}":
            raise ValueError("El código del club debe ser CP + número de club")
        return codigo 