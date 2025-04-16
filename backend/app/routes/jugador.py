from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import asc, desc
from typing import List, Optional
from ..db.session import get_db
from ..models.jugador import Jugador
from ..models.club import Club
from ..schemas.jugador import JugadorCreate, JugadorResponse, JugadorUpdate
from pydantic import BaseModel

router = APIRouter(
    prefix="/jugadores",
    tags=["jugadores"]
)

class JugadoresPaginadosResponse(BaseModel):
    total: int
    jugadores: List[JugadorResponse]

@router.post("/", response_model=JugadorResponse)
def crear_jugador(jugador: JugadorCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo jugador
    """
    # Generar IDFED con relleno para numero_jugador
    numero_jugador_rellenado = jugador.numero_jugador.zfill(4) # Rellenar a 4 dígitos
    idfed = f"{jugador.cp}{numero_jugador_rellenado}" # Usar el número rellenado
    
    # Verificar si ya existe el IDFED
    db_jugador = db.query(Jugador).filter(Jugador.idfed == idfed).first()
    if db_jugador:
        raise HTTPException(status_code=400, detail="El IDFED ya existe")
    
    # Crear la instancia guardando el numero_jugador CON relleno
    nuevo_jugador = Jugador(
        cp=jugador.cp,
        numero_jugador=numero_jugador_rellenado, # <-- GUARDAR EL RELLENADO
        idfed=idfed, 
        nombre=jugador.nombre,
        apellidos=jugador.apellidos,
        codigo_club=jugador.codigo_club,
        dni=jugador.dni,
        telefono=jugador.telefono,
        email=jugador.email
    )
    
    try:
        db.add(nuevo_jugador)
        db.commit()
        db.refresh(nuevo_jugador)
        return nuevo_jugador
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=JugadoresPaginadosResponse)
def get_jugadores(
    skip: int = 0, 
    limit: int = 10, 
    sort_by: Optional[str] = Query(None, alias="sort_by", description="Campo por el cual ordenar"),
    sort_dir: Optional[str] = Query('asc', alias="sort_dir", description="Dirección ('asc' o 'desc')"),
    db: Session = Depends(get_db)
):
    """Obtener jugadores con paginación y ordenación."""
    query = db.query(Jugador).options(selectinload(Jugador.club))

    allowed_sort_fields = {
        'idfed': Jugador.idfed,
        'nombre': Jugador.nombre,
        'apellidos': Jugador.apellidos,
        'dni': Jugador.dni,
        'telefono': Jugador.telefono,
        'email': Jugador.email,
        'nombre_club': Club.nombre 
    }

    if sort_by and sort_by in allowed_sort_fields:
        sort_column = allowed_sort_fields[sort_by]
        
        if sort_by == 'nombre_club':
            query = query.join(Jugador.club)
        
        if sort_dir and sort_dir.lower() == 'desc':
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(asc(Jugador.apellidos))

    count_q = query.order_by(None)
    total = count_q.count()

    jugadores = query.offset(skip).limit(limit).all()

    return JugadoresPaginadosResponse(total=total, jugadores=jugadores)

@router.get("/{idfed}", response_model=JugadorResponse)
def obtener_jugador(idfed: str, db: Session = Depends(get_db)):
    """
    Obtener un jugador por su IDFED
    """
    jugador = db.query(Jugador).filter(Jugador.idfed == idfed).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    return jugador

@router.post("/actualizar/{idfed}", response_model=JugadorResponse)
def actualizar_jugador(idfed: str, jugador_data: JugadorUpdate, db: Session = Depends(get_db)):
    """
    Actualizar un jugador existente por su IDFED
    """
    # Buscar el jugador
    jugador = db.query(Jugador).filter(Jugador.idfed == idfed).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    
    # Actualizar solo los campos permitidos
    jugador.nombre = jugador_data.nombre
    jugador.apellidos = jugador_data.apellidos
    jugador.codigo_club = jugador_data.codigo_club
    
    # Actualizar campos opcionales
    if jugador_data.dni:
        jugador.dni = jugador_data.dni
    if jugador_data.telefono:
        jugador.telefono = jugador_data.telefono
    if jugador_data.email:
        jugador.email = jugador_data.email
    
    try:
        db.commit()
        db.refresh(jugador)
        return jugador
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/club/{codigo_club}", response_model=List[JugadorResponse])
def obtener_jugadores_por_club(codigo_club: str, db: Session = Depends(get_db)):
    """
    Obtener todos los jugadores de un club específico
    """
    jugadores = db.query(Jugador).filter(Jugador.codigo_club == codigo_club).all()
    return jugadores

@router.delete("/{idfed}", response_model=JugadorResponse)
def eliminar_jugador(idfed: str, db: Session = Depends(get_db)):
    """
    Eliminar un jugador por su IDFED
    """
    # Buscar el jugador
    jugador = db.query(Jugador).filter(Jugador.idfed == idfed).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    
    try:
        # Guardar los datos del jugador antes de eliminarlo para retornarlos
        jugador_eliminado = JugadorResponse.from_orm(jugador)
        # Eliminar el jugador
        db.delete(jugador)
        db.commit()
        return jugador_eliminado
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al eliminar el jugador: {str(e)}") 