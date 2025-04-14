from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel
from ..db.session import get_db
from ..models.club import Club
from ..schemas.club import ClubCreate, ClubResponse, ClubUpdate

router = APIRouter(
    prefix="/clubs",
    tags=["clubs"]
)

class ClubsPaginadosResponse(BaseModel):
    total: int
    clubs: List[ClubResponse]

@router.post("/", response_model=ClubResponse)
def crear_club(club: ClubCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo club
    """
    # Generar código_club con relleno para numero_club
    numero_club_rellenado = club.numero_club.zfill(4) # Rellena con ceros a 4 dígitos
    codigo_club = f"{club.cp}{numero_club_rellenado}"
    
    # Verificar si ya existe
    db_club = db.query(Club).filter(Club.codigo_club == codigo_club).first()
    if db_club:
        raise HTTPException(status_code=400, detail="El código de club ya existe")
    
    # Guardar el numero_club CON relleno
    nuevo_club = Club(
        cp=club.cp,
        numero_club=numero_club_rellenado,
        codigo_club=codigo_club,
        nombre=club.nombre,
        persona_contacto=club.persona_contacto,
        telefono=club.telefono,
        direccion=club.direccion,
        email=club.email
    )
    
    try:
        db.add(nuevo_club)
        db.commit()
        db.refresh(nuevo_club)
        return nuevo_club
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=ClubsPaginadosResponse)
def obtener_clubs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Obtener clubs con paginación e información total.
    (Nota: joinedload puede ser menos eficiente con paginación si hay muchos jugadores por club)
    """
    # Obtener el total de clubs
    total_clubs = db.query(Club).count()
    
    # Obtener los clubs de la página actual
    # Considerar quitar joinedload si causa problemas de rendimiento con limit/offset
    clubs_pagina = db.query(Club).options(joinedload(Club.jugadores)).offset(skip).limit(limit).all()
    
    # Devolver la respuesta estructurada
    return ClubsPaginadosResponse(total=total_clubs, clubs=clubs_pagina)

@router.get("/{codigo_club}", response_model=ClubResponse)
def obtener_club(codigo_club: str, db: Session = Depends(get_db)):
    """
    Obtener un club por su código con carga eager de jugadores
    """
    club = db.query(Club).options(joinedload(Club.jugadores)).filter(Club.codigo_club == codigo_club).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    return club

@router.put("/{codigo_club}", response_model=ClubResponse)
def actualizar_club(codigo_club: str, club_data: ClubUpdate, db: Session = Depends(get_db)):
    """
    Actualizar un club existente.
    Nota: Usa ClubUpdate que tiene campos opcionales.
    No permite cambiar CP ni Numero Club (ya que forman codigo_club).
    """
    club_db = db.query(Club).filter(Club.codigo_club == codigo_club).first()
    if not club_db:
        raise HTTPException(status_code=404, detail="Club no encontrado")

    # Actualizar campos usando los datos de ClubUpdate (que pueden ser None)
    update_data_dict = club_data.model_dump(exclude_unset=True) # Excluir campos no enviados
    
    for key, value in update_data_dict.items():
        # Asegurarse de que solo actualizamos atributos que existen en el modelo Club
        if hasattr(club_db, key):
            setattr(club_db, key, value)

    try:
        db.commit()
        db.refresh(club_db)
        return club_db
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{codigo_club}", response_model=ClubResponse)
def eliminar_club(codigo_club: str, db: Session = Depends(get_db)):
    """
    Eliminar un club por su código
    """
    # Buscar el club
    club = db.query(Club).filter(Club.codigo_club == codigo_club).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    
    # Verificar si el club tiene jugadores asociados
    if len(club.jugadores) > 0:
        raise HTTPException(
            status_code=400, 
            detail="No se puede eliminar el club porque tiene jugadores asociados. Elimine o reasigne los jugadores primero."
        )
    
    try:
        # Guardar los datos del club antes de eliminarlo para retornarlos
        club_eliminado = ClubResponse.from_orm(club)
        # Eliminar el club
        db.delete(club)
        db.commit()
        return club_eliminado
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al eliminar el club: {str(e)}") 