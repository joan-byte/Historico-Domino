from pydantic import BaseModel, validator
from typing import Optional
import re

class ClubBase(BaseModel):
    cp: str
    numero_club: str
    nombre: str

    @validator('cp')
    def validar_cp(cls, v):
        if not v.isdigit() or len(v) != 2:
            raise ValueError('CP debe ser exactamente 2 dígitos')
        return v

    @validator('numero_club')
    def validar_numero_club(cls, v):
        if not v.isdigit() or len(v) > 4:
            raise ValueError('Número de club debe tener máximo 4 dígitos')
        return v

class ClubCreate(ClubBase):
    pass

class ClubResponse(ClubBase):
    id: int
    codigo_club: str

    class Config:
        from_attributes = True 