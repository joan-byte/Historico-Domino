"""add campeonato_id to resultados

Revision ID: add_campeonato_id_to_resultados
Revises: c62ac771e799
Create Date: 2024-03-19 10:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_campeonato_id_to_resultados'
down_revision = 'c62ac771e799'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Añadir la columna campeonato_id a la tabla resultados
    op.add_column('resultados',
        sa.Column('campeonato_id', sa.Integer(), nullable=True)
    )
    
    # Añadir la foreign key
    op.create_foreign_key(
        'fk_resultados_campeonato_id',
        'resultados', 'campeonatos',
        ['campeonato_id'], ['id']
    )

def downgrade() -> None:
    # Eliminar la foreign key
    op.drop_constraint(
        'fk_resultados_campeonato_id',
        'resultados',
        type_='foreignkey'
    )
    
    # Eliminar la columna
    op.drop_column('resultados', 'campeonato_id') 