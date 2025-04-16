from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, select, asc, desc
from typing import List, Optional
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
def get_clubs(
    skip: int = 0, 
    limit: int = 10, 
    sort_by: Optional[str] = Query(None, alias="sort_by", description="Campo por el cual ordenar (ej: nombre)"),
    sort_dir: Optional[str] = Query('asc', alias="sort_dir", description="Dirección de ordenación ('asc' o 'desc')"),
    db: Session = Depends(get_db)
):
    """Obtener todos los clubs con paginación y ordenación."""
    query = db.query(Club)
    
    # Mapeo de campos permitidos para ordenar (evita inyección SQL)
    allowed_sort_fields = {
        'codigo_club': Club.codigo_club,
        'nombre': Club.nombre,
        'cp': Club.cp,
        'numero_club': Club.numero_club,
        'persona_contacto': Club.persona_contacto,
        'telefono': Club.telefono,
        'direccion': Club.direccion,
        'email': Club.email,
        # Añade otros campos si son necesarios
    }
    
    # Aplicar ordenación si se proporciona un campo válido
    if sort_by and sort_by in allowed_sort_fields:
        sort_column = allowed_sort_fields[sort_by]
        if sort_dir and sort_dir.lower() == 'desc':
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        # Orden por defecto si no se especifica o el campo no es válido
        query = query.order_by(asc(Club.codigo_club))
            
    total = query.count() # Contar sobre la query base (después de filtrar si hubiera)
    
    # Aplicar offset y limit después de ordenar y contar
    clubs = query.offset(skip).limit(limit).all()
    
    return ClubsPaginadosResponse(total=total, clubs=clubs)

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