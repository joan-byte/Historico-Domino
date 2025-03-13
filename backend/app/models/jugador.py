from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.orm import validates, relationship, column_property
from sqlalchemy.ext.hybrid import hybrid_property
from .base import Base

class Jugador(Base):
    """
    Modelo para la tabla de Jugadores
    """
    __tablename__ = 'jugadores'
    
    # Identificador único automático
    id = Column(Integer, primary_key=True)
    
    # Código Postal (primeras dos cifras)
    cp = Column(String(2), nullable=False)
    
    # Número asignado por el usuario (5 dígitos)
    numero_jugador = Column('numero_usuario', String(5), nullable=False)  # Mapeado a 'numero_usuario' en la BD
    
    # IDFED (CP + número jugador = 7 dígitos)
    idfed = Column(String(7), unique=True, nullable=False)
    
    # Datos personales obligatorios
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(200), nullable=False)
    
    # Datos personales opcionales
    dni = Column(String(9), unique=True, nullable=True)
    telefono = Column(String(15), nullable=True)
    email = Column(String(120), unique=True, nullable=True)
    
    # Relación con el club
    codigo_club = Column(String(6), ForeignKey('clubs.codigo_club'), nullable=False)
    club = relationship("Club", back_populates="jugadores")
    
    # Propiedad para acceder al nombre del club
    @hybrid_property
    def nombre_club(self):
        """
        Retorna el nombre del club al que pertenece el jugador
        """
        return self.club.nombre if self.club else None
    
    # Restricciones de formato
    __table_args__ = (
        CheckConstraint("cp ~ '^[0-9]{2}$'", name='check_cp_formato_jugador'),
        CheckConstraint("numero_usuario ~ '^[0-9]{5}$'", name='check_numero_jugador_formato'),  # Cambiado a numero_usuario para coincidir con la BD
    )
    
    @validates('cp')
    def validar_cp(self, key, cp):
        """
        Valida que el CP tenga exactamente 2 dígitos
        """
        if not cp.isdigit() or len(cp) != 2:
            raise ValueError("El CP debe ser exactamente 2 dígitos numéricos")
        return cp
    
    @validates('numero_jugador')
    def validar_numero_jugador(self, key, numero):
        """
        Valida que el número de jugador sea numérico y tenga exactamente 5 dígitos
        """
        if not numero.isdigit() or len(numero) != 5:
            raise ValueError("El número debe ser numérico y tener exactamente 5 dígitos")
        return numero
    
    @validates('idfed')
    def validar_idfed(self, key, idfed):
        """
        Asegura que el IDFED sea la concatenación de CP y número de jugador
        """
        if idfed != f"{self.cp}{self.numero_jugador}":
            raise ValueError("El IDFED debe ser CP + número de jugador")
        return idfed
    
    @validates('dni')
    def validar_dni(self, key, dni):
        """
        Valida el formato del DNI si se proporciona
        """
        if dni is not None:
            if len(dni) != 9 or not dni[:-1].isdigit() or not dni[-1].isalpha():
                raise ValueError("Formato de DNI inválido")
        return dni

    def __repr__(self):
        """
        Representación string del jugador incluyendo el nombre del club
        """
        return f"<Jugador {self.nombre} {self.apellidos} - IDFED: {self.idfed} - Club: {self.nombre_club}>" 