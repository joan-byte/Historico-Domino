from pydantic import BaseModel, Field
from datetime import date
from typing import Optional, List

class CampeonatoBase(BaseModel):
    """Schema base para campeonatos"""
    nombre: str = Field(..., min_length=1, max_length=100)
    fecha_inicio: date
    fecha_fin: date
    tipo_campeonato_id: int

class CampeonatoCreate(CampeonatoBase):
    """Schema para crear un campeonato"""
    pass

class CampeonatoUpdate(BaseModel):
    """Schema para actualizar un campeonato"""
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    tipo_campeonato_id: Optional[int] = None

class Campeonato(CampeonatoBase):
    """Schema para respuesta de campeonato"""
    id: int
    
    class Config:
        orm_mode = True 