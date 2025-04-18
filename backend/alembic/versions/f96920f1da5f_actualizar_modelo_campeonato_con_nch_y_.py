"""Actualizar modelo Campeonato con NCH y nuevos campos, y ajustar FK en Resultado

Revision ID: f96920f1da5f
Revises: 192c6028dc0e
Create Date: 2025-04-15 09:28:51.783025

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f96920f1da5f'
down_revision: Union[str, None] = '192c6028dc0e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - ADJUSTED ORDER ###

    # --- Preparations for campeonatos table changes ---
    # Remove the FK constraint from resultados that points to campeonatos.id FIRST
    op.drop_constraint('resultados_campeonato_id_fkey', 'resultados', type_='foreignkey')
    # Also drop the corresponding column in resultados
    op.drop_column('resultados', 'campeonato_id')
    # Remove the index on the old campeonatos.id
    op.drop_index('ix_campeonatos_id', table_name='campeonatos')

    # --- Modify campeonatos table ---
    # Add all new columns
    op.add_column('campeonatos', sa.Column('nch', sa.String(length=20), nullable=False))
    op.add_column('campeonatos', sa.Column('dias', sa.Integer(), nullable=False))
    op.add_column('campeonatos', sa.Column('partidas', sa.Integer(), nullable=False))
    op.add_column('campeonatos', sa.Column('pm', sa.Integer(), nullable=False))
    op.add_column('campeonatos', sa.Column('gb', sa.Boolean(), nullable=False))
    op.add_column('campeonatos', sa.Column('gbp', sa.Integer(), nullable=True))
    op.add_column('campeonatos', sa.Column('club_id', sa.Integer(), nullable=False))
    # Create index for the new primary key nch
    op.create_index(op.f('ix_campeonatos_nch'), 'campeonatos', ['nch'], unique=True)
    # Create FK for club_id
    op.create_foreign_key(None, 'campeonatos', 'clubs', ['club_id'], ['id']) # Assuming clubs.id exists and is PK
    # NOW it's safe to drop the old id column
    op.drop_column('campeonatos', 'id')
    # Drop the other old column
    op.drop_column('campeonatos', 'fecha_fin')

    # --- Modify resultados table (add new FK) ---
    # Add the new column referencing campeonatos.nch
    op.add_column('resultados', sa.Column('campeonato_nch', sa.String(length=20), nullable=True))
    # Create index for the new FK column
    op.create_index(op.f('ix_resultados_campeonato_nch'), 'resultados', ['campeonato_nch'], unique=False)
    # Create the new FK constraint pointing to campeonatos.nch
    op.create_foreign_key(None, 'resultados', 'campeonatos', ['campeonato_nch'], ['nch'])

    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - PLEASE REVIEW CAREFULLY ###
    # Note: The downgrade path might need similar adjustments if used.
    op.drop_constraint(None, 'resultados', type_='foreignkey')
    op.drop_index(op.f('ix_resultados_campeonato_nch'), table_name='resultados')
    op.drop_column('resultados', 'campeonato_nch')

    op.add_column('campeonatos', sa.Column('fecha_fin', sa.DATE(), autoincrement=False, nullable=False))
    op.add_column('campeonatos', sa.Column('id', sa.INTEGER(), server_default=sa.text("nextval('campeonatos_id_seq'::regclass)"), autoincrement=True, nullable=False)) # Might need adjustment based on original PK setup
    op.drop_constraint(None, 'campeonatos', type_='foreignkey') # Drops FK to clubs
    op.drop_index(op.f('ix_campeonatos_nch'), table_name='campeonatos')
    op.create_index('ix_campeonatos_id', 'campeonatos', ['id'], unique=False) # Recreate old index
    op.drop_column('campeonatos', 'club_id')
    op.drop_column('campeonatos', 'gbp')
    op.drop_column('campeonatos', 'gb')
    op.drop_column('campeonatos', 'pm')
    op.drop_column('campeonatos', 'partidas')
    op.drop_column('campeonatos', 'dias')
    op.drop_column('campeonatos', 'nch')

    # Recreate old column and FK in resultados LAST
    op.add_column('resultados', sa.Column('campeonato_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('resultados_campeonato_id_fkey', 'resultados', 'campeonatos', ['campeonato_id'], ['id'])
    # ### end Alembic commands ###
