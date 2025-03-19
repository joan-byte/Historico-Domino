from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from ..core.config import settings

# Crear el motor de la base de datos
engine = create_engine(
    settings.DATABASE_URL,
    # Desactivar el pooling para entornos de desarrollo
    poolclass=NullPool if settings.DEBUG else None,
    echo=False,  # Desactivar consultas SQL siempre
    echo_pool=False,  # Desactivar logs de pool
)

# Crear la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Función para obtener una sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 