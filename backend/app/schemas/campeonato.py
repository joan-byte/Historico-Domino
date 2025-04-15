from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

# Importar schemas relacionados para anidación en la respuesta
from .tipo_campeonato import TipoCampeonatoResponse
from .club import ClubResponse

class CampeonatoBase(BaseModel):
    """Schema base para campeonatos, representa los datos necesarios para crear/actualizar."""
    nombre: str = Field(..., min_length=1, max_length=100, description="Nombre del campeonato")
    fecha_inicio: date = Field(..., description="Fecha de inicio del campeonato")
    dias: int = Field(..., gt=0, description="Número de días del campeonato")
    partidas: int = Field(..., gt=0, description="Número total de partidas")
    pm: int = Field(..., gt=0, description="Puntuación Máxima por partida")
    gb: bool = Field(False, description="¿Es Grupo B? (False=A, True=B)")
    gbp: Optional[int] = Field(None, gt=0, description="Partida de inicio del Grupo B (si gb=True)")
    
    # Claves foráneas requeridas del frontend
    tipo_campeonato_id: int = Field(..., description="ID del Tipo de Campeonato relacionado")
    club_codigo: str = Field(..., description="Código del Club organizador relacionado")

class CampeonatoCreate(CampeonatoBase):
    """Schema para crear un campeonato. Hereda todos los campos base.
    El campo NCH se genera automáticamente en el backend."""
    pass

class CampeonatoUpdate(BaseModel):
    """Schema para actualizar un campeonato. Todos los campos son opcionales."""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    fecha_inicio: Optional[date] = None
    dias: Optional[int] = Field(None, gt=0)
    partidas: Optional[int] = Field(None, gt=0)
    pm: Optional[int] = Field(None, gt=0)
    gb: Optional[bool] = None
    gbp: Optional[int] = Field(None, gt=0) # Permitir actualizar gbp
    # tipo_campeonato_id y club_codigo normalmente no se actualizan, pero se podrían añadir si fuera necesario.
    # tipo_campeonato_id: Optional[int] = None
    # club_codigo: Optional[str] = None 

class CampeonatoResponse(CampeonatoBase):
    """Schema para la respuesta de la API, incluye NCH y puede incluir objetos relacionados."""
    nch: str = Field(..., description="Número Campeonato Histórico (PK)")
    
    # Anidar objetos relacionados (opcional, depende de la consulta)
    # tipo_campeonato: Optional[TipoCampeonatoResponse] = None
    # club: Optional[ClubResponse] = None
    
    class Config:
        # Pydantic V2 usa from_attributes en lugar de orm_mode
        from_attributes = True 