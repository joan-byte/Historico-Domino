import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Desactivar completamente los logs de SQLAlchemy
logging.getLogger('sqlalchemy').disabled = True
logging.getLogger('sqlalchemy.engine').disabled = True
logging.getLogger('sqlalchemy.pool').disabled = True
logging.getLogger('sqlalchemy.dialects').disabled = True
logging.getLogger('sqlalchemy.orm').disabled = True

# Configurar nivel ERROR para todos los loggers relacionados con SQLAlchemy
logging.getLogger('sqlalchemy').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.engine').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.pool').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.dialects').setLevel(logging.ERROR)
logging.getLogger('sqlalchemy.orm').setLevel(logging.ERROR)

# Obtener la URL de la base de datos desde las variables de entorno
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL no está configurada en las variables de entorno")

# Crear el motor de la base de datos con echo=False para desactivar logs
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    echo=False, 
    echo_pool=False,
    logging_name=None
)

# Crear la clase de sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear la clase base para los modelos
Base = declarative_base()

# Exportar Base para que otros módulos puedan importarla
__all__ = ['Base', 'engine'] 