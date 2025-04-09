from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
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

@router.get("/", response_model=List[ClubResponse])
def obtener_clubs(db: Session = Depends(get_db)):
    """
    Obtener todos los clubs con carga eager de jugadores
    """
    clubs = db.query(Club).options(joinedload(Club.jugadores)).all()
    return clubs

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
def actualizar_club(codigo_club: str, club_data: ClubCreate, db: Session = Depends(get_db)):
    """
    Actualizar un club existente
    """
    # Buscar el club
    club_db = db.query(Club).filter(Club.codigo_club == codigo_club).first() # Renombrado a club_db para evitar conflicto
    if not club_db:
        raise HTTPException(status_code=404, detail="Club no encontrado")
    
    # Generar nuevo código con relleno
    numero_club_rellenado = club_data.numero_club.zfill(4)
    nuevo_codigo_club = f"{club_data.cp}{numero_club_rellenado}"

    # Verificar si el nuevo código ya existe (y no es el club actual)
    if nuevo_codigo_club != codigo_club:
        conflicto = db.query(Club).filter(Club.codigo_club == nuevo_codigo_club).first()
        if conflicto:
            raise HTTPException(status_code=400, detail=f"El nuevo código de club '{nuevo_codigo_club}' generado ya está en uso.")

    # Actualizar los campos guardando numero_club CON relleno
    club_db.nombre = club_data.nombre
    club_db.cp = club_data.cp
    club_db.numero_club = numero_club_rellenado
    club_db.codigo_club = nuevo_codigo_club
    club_db.persona_contacto = club_data.persona_contacto
    club_db.telefono = club_data.telefono
    club_db.direccion = club_data.direccion
    club_db.email = club_data.email
    
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