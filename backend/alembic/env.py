from logging.config import fileConfig
import os
from dotenv import load_dotenv

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Cargar variables de entorno desde .env
# Asegúrate de que la ruta al .env sea correcta desde la ubicación de env.py
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env') # Sube un nivel desde alembic/ a backend/
loaded_dotenv = load_dotenv(dotenv_path=dotenv_path)

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Configurar sqlalchemy.url desde la variable de entorno DATABASE_URL
# Esto sobreescribirá el valor de alembic.ini si la variable existe
database_url = os.getenv("DATABASE_URL")
if database_url:
    config.set_main_option("sqlalchemy.url", database_url)
else:
    # Opcional: manejar caso si DATABASE_URL no está en .env, usar alembic.ini
    print("ADVERTENCIA: DATABASE_URL no encontrada en .env, usando valor de alembic.ini")

# Interpretar el archivo de configuración para el logging de Python.
# Esta línea asume que el archivo ini ya está configurado para logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
from app.models.base import Base
from app.models.club import Club
from app.models.jugador import Jugador
from app.models.tipo_campeonato import TipoCampeonato
from app.models.campeonato import Campeonato
from app.models.resultado import Resultado

target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    # Usar la URL configurada (desde  o .ini)
    url = config.get_main_option("sqlalchemy.url") 
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    # Usar engine_from_config que ya utiliza la sección [alembic] 
    # donde hemos configurado sqlalchemy.url
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
