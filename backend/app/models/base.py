from sqlalchemy.ext.declarative import declarative_base

# Importar Base desde database
from ..db.database import Base

# Exportar Base para que otros módulos puedan importarla
__all__ = ['Base']