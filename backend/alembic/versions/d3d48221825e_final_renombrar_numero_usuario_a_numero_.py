"""FINAL - Renombrar numero_usuario a numero_jugador, String(4), constraint 1-4

Revision ID: d3d48221825e
Revises: add_campeonato_id_to_resultados
Create Date: 2025-04-09 09:36:00.000000 # Fecha puede variar

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3d48221825e'
down_revision: Union[str, None] = 'add_campeonato_id_to_resultados' # Asegúrate que este es el ID correcto anterior
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    # 1. Eliminar la check constraint original (que usa numero_usuario y regla 5)
    op.drop_constraint('check_numero_usuario_formato', 'jugadores', type_='check')

    # 2. Renombrar la columna numero_usuario a numero_jugador y cambiar tipo a String(4)
    op.alter_column('jugadores',
                    'numero_usuario',                  # Nombre viejo
                    new_column_name='numero_jugador',  # Nombre nuevo
                    existing_type=sa.VARCHAR(length=5),# Tipo original en BD
                    type_=sa.String(length=4),           # Tipo nuevo
                    nullable=False)

    # 3. Crear la nueva check constraint (referenciando numero_jugador y con regla 1-4)
    op.create_check_constraint(
        'check_numero_jugador_formato', # Nuevo nombre para la constraint
        'jugadores',
        "numero_jugador ~ '^[0-9]{1,4}$'" # Regla 1-4 para numero_jugador
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    # 1. Eliminar la nueva check constraint (la de numero_jugador con regla 1-4)
    op.drop_constraint('check_numero_jugador_formato', 'jugadores', type_='check')

    # 2. Renombrar la columna de vuelta a numero_usuario y tipo VARCHAR(5)
    op.alter_column('jugadores',
                    'numero_jugador',                  # Nombre actual
                    new_column_name='numero_usuario',  # Nombre original
                    existing_type=sa.String(length=4),   # Tipo actual
                    type_=sa.VARCHAR(length=5),        # Tipo original
                    nullable=False)

    # 3. Recrear la check constraint original (que usa numero_usuario y regla 5)
    op.create_check_constraint(
        'check_numero_usuario_formato', # Nombre original de la constraint
        'jugadores',
        "numero_usuario ~ '^[0-9]{5}$'" # Regla original de 5 dígitos
    )
    # ### end Alembic commands ###