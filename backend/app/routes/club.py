from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from ..models.club import Club
from ..schemas.club import ClubCreate, ClubResponse

router = APIRouter(
    prefix="/clubs",
    tags=["clubs"]
)

@router.post("/", response_model=ClubResponse)
def crear_club(club: ClubCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo club
    """
    # Generar código_club
    codigo_club = f"{club.cp}{club.numero_club}"
    
    # Verificar si ya existe
    db_club = db.query(Club).filter(Club.codigo_club == codigo_club).first()
    if db_club:
        raise HTTPException(status_code=400, detail="El código de club ya existe")
    
    nuevo_club = Club(
        cp=club.cp,
        numero_club=club.numero_club,
        codigo_club=codigo_club,
        nombre=club.nombre
    )
    
    try:
        db.add(nuevo_club)
        db.commit()
        db.refresh(nuevo_club)
        return nuevo_club
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ClubResponse])
def listar_clubs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Listar todos los clubs
    """
    return db.query(Club).offset(skip).limit(limit).all()

@router.get("/{codigo_club}", response_model=ClubResponse)
def obtener_club(codigo_club: str, db: Session = Depends(get_db)):
    """
    Obtener un club por su código
    """
    club = db.query(Club).filter(Club.codigo_club == codigo_club).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    return club

@router.put("/{codigo_club}", response_model=ClubResponse)
def actualizar_club(codigo_club: str, club_data: ClubCreate, db: Session = Depends(get_db)):
    """
    Actualizar un club existente
    """
    # Buscar el club
    club = db.query(Club).filter(Club.codigo_club == codigo_club).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    
    # Actualizar los campos
    club.nombre = club_data.nombre
    club.cp = club_data.cp
    club.numero_club = club_data.numero_club
    club.codigo_club = f"{club_data.cp}{club_data.numero_club}"
    
    try:
        db.commit()
        db.refresh(club)
        return club
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