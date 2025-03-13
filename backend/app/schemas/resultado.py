from pydantic import BaseModel, validator
from typing import Optional
from datetime import date

class ResultadoBase(BaseModel):
    """
    Esquema base para los resultados de campeonatos
    """
    tipo_campeonato_id: int
    nombre_campeonato: str
    fecha_campeonato: date
    idfed_jugador: str
    nombre_jugador: str
    apellido_jugador: str
    codigo_club_jugador: str
    nombre_club_jugador: str
    idfed_pareja: Optional[str] = None
    nombre_pareja: Optional[str] = None
    apellido_pareja: Optional[str] = None
    codigo_club_pareja: Optional[str] = None
    nombre_club_pareja: Optional[str] = None
    partida: int
    mesa: int
    gb: bool = True  # Por defecto A (True)
    pg: int
    dif: int
    pv: int
    pt: int
    mg: int
    pos: int

    @validator('idfed_jugador', 'idfed_pareja')
    def validar_idfed(cls, v):
        """
        Valida el formato del IDFED si se proporciona
        """
        if v is not None:
            if len(v) != 7 or not v.isdigit():
                raise ValueError("El IDFED debe tener 7 dígitos numéricos")
        return v

    @validator('codigo_club_jugador', 'codigo_club_pareja')
    def validar_codigo_club(cls, v):
        """
        Valida el formato del código de club si se proporciona
        """
        if v is not None:
            if len(v) != 6 or not v.isdigit():
                raise ValueError("El código del club debe tener 6 dígitos numéricos")
        return v

class ResultadoCreate(ResultadoBase):
    """
    Esquema para crear un nuevo resultado
    """
    pass

class ResultadoUpdate(BaseModel):
    """
    Esquema para actualizar un resultado existente
    """
    tipo_campeonato_id: Optional[int] = None
    nombre_campeonato: Optional[str] = None
    partida: Optional[int] = None
    mesa: Optional[int] = None
    gb: Optional[bool] = None
    pg: Optional[int] = None
    dif: Optional[int] = None
    pv: Optional[int] = None
    pt: Optional[int] = None
    mg: Optional[int] = None
    pos: Optional[int] = None

class ResultadoResponse(ResultadoBase):
    """
    Esquema para la respuesta con un resultado
    """
    nch: int
    codigo_tipo_campeonato: str

    class Config:
        from_attributes = True 