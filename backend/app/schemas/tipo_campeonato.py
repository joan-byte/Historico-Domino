from pydantic import BaseModel, validator

class TipoCampeonatoBase(BaseModel):
    """
    Esquema base para los tipos de campeonatos
    """
    codigo: str
    nombre: str
    descripcion: str = None

    @validator('codigo')
    def validar_codigo(cls, v):
        """
        Valida que el código tenga exactamente 2 letras mayúsculas
        """
        if not v.isalpha() or len(v) != 2 or not v.isupper():
            raise ValueError("El código debe ser exactamente 2 letras mayúsculas")
        return v

class TipoCampeonatoCreate(TipoCampeonatoBase):
    """
    Esquema para crear un nuevo tipo de campeonato
    """
    pass

class TipoCampeonatoResponse(TipoCampeonatoBase):
    """
    Esquema para la respuesta con un tipo de campeonato
    """
    id: int

    class Config:
        from_attributes = True 