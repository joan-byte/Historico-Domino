from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from ..models.jugador import Jugador
from ..schemas.jugador import JugadorCreate, JugadorResponse, JugadorUpdate

router = APIRouter(
    prefix="/jugadores",
    tags=["jugadores"]
)

@router.post("/", response_model=JugadorResponse)
def crear_jugador(jugador: JugadorCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo jugador
    """
    # Generar IDFED
    idfed = f"{jugador.cp}{jugador.numero_jugador}"
    
    # Verificar si ya existe
    db_jugador = db.query(Jugador).filter(Jugador.idfed == idfed).first()
    if db_jugador:
        raise HTTPException(status_code=400, detail="El IDFED ya existe")
    
    nuevo_jugador = Jugador(
        cp=jugador.cp,
        numero_jugador=jugador.numero_jugador,
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

@router.get("/", response_model=List[JugadorResponse])
def listar_jugadores(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Listar todos los jugadores
    """
    return db.query(Jugador).offset(skip).limit(limit).all()

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