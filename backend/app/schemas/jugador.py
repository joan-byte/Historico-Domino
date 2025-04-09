from pydantic import BaseModel, EmailStr, validator
from typing import Optional

class JugadorBase(BaseModel):
    cp: str
    numero_jugador: str
    nombre: str
    apellidos: str
    codigo_club: str
    dni: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None

    @validator('cp')
    def validar_cp(cls, v):
        if not v.isdigit() or len(v) != 2:
            raise ValueError('CP debe ser exactamente 2 dígitos')
        return v

    @validator('numero_jugador')
    def validar_numero_jugador(cls, v):
        if not v.isdigit() or not (1 <= len(v) <= 4):
            raise ValueError('Número de jugador debe tener entre 1 y 4 dígitos')
        return v

    @validator('dni')
    def validar_dni(cls, v):
        if v == "string":
            return None
        if v is not None and not (len(v) == 9 and v[:-1].isdigit() and v[-1].isalpha()):
            raise ValueError('DNI debe tener formato válido (8 números y una letra)')
        return v

    @validator('telefono')
    def validar_telefono(cls, v):
        if v == "string":
            return None
        return v

    @validator('email')
    def validar_email(cls, v):
        if v == "string":
            return None
        return v

class JugadorCreate(JugadorBase):
    pass

# Esquema específico para actualización - no requiere CP ni numero_jugador
class JugadorUpdate(BaseModel):
    nombre: str
    apellidos: str
    codigo_club: str
    dni: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    
    @validator('dni')
    def validar_dni(cls, v):
        if v == "string":
            return None
        if v is not None and not (len(v) == 9 and v[:-1].isdigit() and v[-1].isalpha()):
            raise ValueError('DNI debe tener formato válido (8 números y una letra)')
        return v

class JugadorResponse(JugadorBase):
    id: int
    idfed: str
    nombre_club: str

    class Config:
        from_attributes = True 