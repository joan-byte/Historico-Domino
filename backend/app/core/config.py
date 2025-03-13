from typing import List
from pydantic import AnyHttpUrl, BaseModel, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Configuración de la base de datos
    DATABASE_URL: str
    
    # Configuración de seguridad
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Configuración de la aplicación
    APP_NAME: str
    APP_VERSION: str
    APP_DESCRIPTION: str
    APP_CONTACT_EMAIL: str
    
    # Configuración del servidor
    HOST: str
    PORT: int
    RELOAD: bool
    DEBUG: bool
    
    # Configuración de CORS
    CORS_ORIGINS: List[str]
    
    @field_validator("CORS_ORIGINS", mode='before')
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra='ignore'  # Permite campos extra en el archivo .env
    )

# Instancia de configuración
settings = Settings() 