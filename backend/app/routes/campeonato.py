from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, select
from typing import List
from pydantic import BaseModel
import datetime # Necesario para formatear fecha en NCH
from datetime import date # Importar date explícitamente

from ..db.session import get_db
from ..models.campeonato import Campeonato
# Importar modelos relacionados para obtener códigos para NCH
from ..models.tipo_campeonato import TipoCampeonato 
from ..models.club import Club
# Importar schemas actualizados - Asegurar que se importa CampeonatoResponse
from ..schemas.campeonato import CampeonatoCreate, CampeonatoUpdate, CampeonatoResponse

router = APIRouter(
    prefix="/campeonatos",
    tags=["campeonatos"]
)

# Schema para paginación usando el schema de respuesta actualizado
class CampeonatosPaginadosResponse(BaseModel):
    total: int
    campeonatos: List[CampeonatoResponse] # Corregido para usar CampeonatoResponse

# Helper para generar NCH
async def generar_siguiente_nch(db: Session, club_codigo: str, tipo_campeonato_id: int, fecha_inicio: date) -> str:
    """Genera el siguiente NCH para una combinación de club, tipo y fecha."""
    # 1. Obtener código del tipo de campeonato
    tipo_campeonato = db.query(TipoCampeonato).filter(TipoCampeonato.id == tipo_campeonato_id).first()
    if not tipo_campeonato:
        raise HTTPException(status_code=404, detail="Tipo de campeonato no encontrado para generar NCH")
    codigo_tipo = tipo_campeonato.codigo

    # 2. Formatear fecha
    fecha_str = fecha_inicio.strftime('%Y%m%d')

    # 3. Calcular siguiente incremental (¡simplificado!)
    # Buscar el NCH máximo que empiece con los mismos prefijos
    prefijo_nch = f"{codigo_tipo}{club_codigo}{fecha_str}"
    
    # Construir la consulta para encontrar el máximo nch con el prefijo dado
    stmt = select(func.max(Campeonato.nch)).where(Campeonato.nch.like(f"{prefijo_nch}%"))
    
    # Ejecutar la consulta
    ultimo_nch = db.execute(stmt).scalar_one_or_none()

    if ultimo_nch:
        try:
            ultimo_incremental = int(ultimo_nch[-4:])
            nuevo_incremental = ultimo_incremental + 1
        except ValueError:
            # Si el último NCH no tiene un formato numérico válido al final, empezar de 1
            nuevo_incremental = 1 
    else:
        nuevo_incremental = 1

    if nuevo_incremental > 9999:
        raise HTTPException(status_code=400, detail="Se ha superado el límite de incrementales para este día/club/tipo.")

    incremental_str = f"{nuevo_incremental:04d}"

    # 4. Ensamblar NCH
    return f"{prefijo_nch}{incremental_str}"

@router.get("/", response_model=CampeonatosPaginadosResponse)
def get_campeonatos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Obtener todos los campeonatos. Incluye carga eager de relaciones."""
    query = db.query(Campeonato).options(
        joinedload(Campeonato.tipo_campeonato), 
        joinedload(Campeonato.club)
    )
    total = query.count() # Contar sobre la query base
    # Aplicar offset y limit después de contar
    campeonatos = query.offset(skip).limit(limit).all()
    return CampeonatosPaginadosResponse(total=total, campeonatos=campeonatos)

# Ruta actualizada para usar nch (string)
@router.get("/{nch}", response_model=CampeonatoResponse)
def get_campeonato(nch: str, db: Session = Depends(get_db)):
    """Obtener un campeonato por NCH con carga eager."""
    campeonato = db.query(Campeonato).options(
        joinedload(Campeonato.tipo_campeonato), 
        joinedload(Campeonato.club)
    ).filter(Campeonato.nch == nch).first()
    if not campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    return campeonato

@router.post("/", response_model=CampeonatoResponse, status_code=status.HTTP_201_CREATED)
async def create_campeonato(campeonato: CampeonatoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo campeonato, generando el NCH."""
    # Validar que el club exista
    club = db.query(Club).filter(Club.codigo_club == campeonato.club_codigo).first()
    if not club:
        raise HTTPException(status_code=404, detail=f"Club con código {campeonato.club_codigo} no encontrado.")
        
    # Generar el NCH antes de crear el objeto
    nuevo_nch = await generar_siguiente_nch(db, campeonato.club_codigo, campeonato.tipo_campeonato_id, campeonato.fecha_inicio)
    
    # Crear objeto Campeonato con NCH y datos del schema
    db_campeonato = Campeonato(
        nch=nuevo_nch,
        **campeonato.model_dump() # Usar model_dump() en Pydantic V2
    )
    
    try:
        db.add(db_campeonato)
        db.commit()
        db.refresh(db_campeonato)
        # Cargar relaciones para la respuesta si es necesario
        db.refresh(db_campeonato, attribute_names=['tipo_campeonato', 'club'])
        return db_campeonato
    except Exception as e:
        db.rollback()
        # Podría haber una violación de unicidad si la lógica de NCH falla en concurrencia
        raise HTTPException(status_code=400, detail=f"Error al crear el campeonato: {str(e)}")

# Ruta actualizada para usar nch (string)
@router.put("/{nch}", response_model=CampeonatoResponse)
def update_campeonato(
    nch: str,
    campeonato: CampeonatoUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un campeonato por NCH."""
    db_campeonato = db.query(Campeonato).filter(Campeonato.nch == nch).first()
    if not db_campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    
    # Actualizar campos proporcionados
    update_data = campeonato.model_dump(exclude_unset=True) # Usar model_dump en Pydantic V2
    for key, value in update_data.items():
        setattr(db_campeonato, key, value)
    
    try:
        db.commit()
        db.refresh(db_campeonato)
        # Cargar relaciones para la respuesta si es necesario
        db.refresh(db_campeonato, attribute_names=['tipo_campeonato', 'club'])
        return db_campeonato
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al actualizar el campeonato: {str(e)}")

# Ruta actualizada para usar nch (string)
@router.delete("/{nch}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campeonato(nch: str, db: Session = Depends(get_db)):
    """Eliminar un campeonato por NCH."""
    db_campeonato = db.query(Campeonato).filter(Campeonato.nch == nch).first()
    if not db_campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    
    try:
        db.delete(db_campeonato)
        db.commit()
        return None # Correcto para 204 No Content
    except Exception as e:
        db.rollback()
        # Podría fallar si hay resultados asociados con ON DELETE RESTRICT
        raise HTTPException(status_code=400, detail=f"Error al eliminar el campeonato: {str(e)}") 