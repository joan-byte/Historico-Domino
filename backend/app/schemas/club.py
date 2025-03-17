from pydantic import BaseModel, validator, EmailStr
from typing import Optional
import re

class ClubBase(BaseModel):
    cp: str
    numero_club: str
    nombre: str
    persona_contacto: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    email: Optional[EmailStr] = None

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

    @validator('telefono')
    def validar_telefono(cls, v):
        if v is not None:
            telefono_limpio = ''.join(filter(str.isdigit, v))
            if len(telefono_limpio) < 9 or len(telefono_limpio) > 15:
                raise ValueError('El teléfono debe tener entre 9 y 15 dígitos')
        return v

class ClubCreate(ClubBase):
    pass

class ClubResponse(ClubBase):
    id: int
    codigo_club: str

    class Config:
        from_attributes = True 