from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from ..db.session import get_db
from ..models.resultado import Resultado
from ..models.jugador import Jugador
from ..models.club import Club
from ..models.tipo_campeonato import TipoCampeonato
from ..schemas.resultado import ResultadoCreate, ResultadoResponse, ResultadoUpdate
from pydantic import BaseModel

router = APIRouter(
    prefix="/resultados",
    tags=["resultados"]
)

# --- Schema Paginado --- 
class ResultadosPaginadosResponse(BaseModel):
    total: int
    resultados: List[ResultadoResponse]
# --- Fin Schema --- 

@router.post("/", response_model=ResultadoResponse)
def crear_resultado(resultado: ResultadoCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo resultado de campeonato
    """
    # Verificar que el tipo de campeonato existe
    tipo_campeonato = db.query(TipoCampeonato).filter(TipoCampeonato.id == resultado.tipo_campeonato_id).first()
    if not tipo_campeonato:
        raise HTTPException(status_code=404, detail="Tipo de campeonato no encontrado")
    
    # Verificar que el jugador existe
    jugador = db.query(Jugador).filter(Jugador.idfed == resultado.idfed_jugador).first()
    if not jugador:
        raise HTTPException(status_code=404, detail="Jugador no encontrado")
    
    # Verificar que el club del jugador existe
    club_jugador = db.query(Club).filter(Club.codigo_club == resultado.codigo_club_jugador).first()
    if not club_jugador:
        raise HTTPException(status_code=404, detail="Club del jugador no encontrado")
    
    # Si hay pareja, verificar que existe
    if resultado.idfed_pareja:
        pareja = db.query(Jugador).filter(Jugador.idfed == resultado.idfed_pareja).first()
        if not pareja:
            raise HTTPException(status_code=404, detail="Pareja no encontrada")
        
        # Verificar que el club de la pareja existe
        if resultado.codigo_club_pareja:
            club_pareja = db.query(Club).filter(Club.codigo_club == resultado.codigo_club_pareja).first()
            if not club_pareja:
                raise HTTPException(status_code=404, detail="Club de la pareja no encontrado")
    
    # Crear el nuevo resultado
    nuevo_resultado = Resultado(
        tipo_campeonato_id=resultado.tipo_campeonato_id,
        nombre_campeonato=resultado.nombre_campeonato,
        fecha_campeonato=resultado.fecha_campeonato,
        idfed_jugador=resultado.idfed_jugador,
        nombre_jugador=resultado.nombre_jugador,
        apellido_jugador=resultado.apellido_jugador,
        codigo_club_jugador=resultado.codigo_club_jugador,
        nombre_club_jugador=resultado.nombre_club_jugador,
        idfed_pareja=resultado.idfed_pareja,
        nombre_pareja=resultado.nombre_pareja,
        apellido_pareja=resultado.apellido_pareja,
        codigo_club_pareja=resultado.codigo_club_pareja,
        nombre_club_pareja=resultado.nombre_club_pareja,
        partida=resultado.partida,
        mesa=resultado.mesa,
        gb=resultado.gb,
        pg=resultado.pg,
        dif=resultado.dif,
        pv=resultado.pv,
        pt=resultado.pt,
        mg=resultado.mg,
        pos=resultado.pos
    )
    
    try:
        db.add(nuevo_resultado)
        db.commit()
        db.refresh(nuevo_resultado)
        return nuevo_resultado
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=ResultadosPaginadosResponse)
def listar_resultados(
    skip: int = 0, 
    limit: int = 100, 
    tipo_campeonato_id: Optional[int] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    idfed_jugador: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Listar resultados con filtros opcionales y paginación completa.
    """
    query = db.query(Resultado)
    
    # Aplicar filtros si se proporcionan
    if tipo_campeonato_id:
        query = query.filter(Resultado.tipo_campeonato_id == tipo_campeonato_id)
    if fecha_desde:
        query = query.filter(Resultado.fecha_campeonato >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Resultado.fecha_campeonato <= fecha_hasta)
    if idfed_jugador:
        query = query.filter(Resultado.idfed_jugador == idfed_jugador)
    
    # Contar el total DESPUÉS de aplicar filtros
    total_resultados = query.count()
    
    # Aplicar paginación
    resultados_pagina = query.offset(skip).limit(limit).all()
    
    return ResultadosPaginadosResponse(total=total_resultados, resultados=resultados_pagina)

@router.get("/{nch}/{fecha_campeonato}/{idfed_jugador}", response_model=ResultadoResponse)
def obtener_resultado(
    nch: int, 
    fecha_campeonato: date, 
    idfed_jugador: str, 
    db: Session = Depends(get_db)
):
    """
    Obtener un resultado específico por su clave primaria compuesta
    """
    resultado = db.query(Resultado).filter(
        Resultado.nch == nch,
        Resultado.fecha_campeonato == fecha_campeonato,
        Resultado.idfed_jugador == idfed_jugador
    ).first()
    
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    
    return resultado

@router.get("/jugador/{idfed_jugador}", response_model=List[ResultadoResponse])
def obtener_resultados_por_jugador(idfed_jugador: str, db: Session = Depends(get_db)):
    """
    Obtener todos los resultados de un jugador específico
    """
    resultados = db.query(Resultado).filter(Resultado.idfed_jugador == idfed_jugador).all()
    return resultados

@router.get("/tipo-campeonato/{tipo_campeonato_id}", response_model=List[ResultadoResponse])
def obtener_resultados_por_tipo_campeonato(tipo_campeonato_id: int, db: Session = Depends(get_db)):
    """
    Obtener todos los resultados de un tipo de campeonato específico
    """
    resultados = db.query(Resultado).filter(Resultado.tipo_campeonato_id == tipo_campeonato_id).all()
    return resultados

@router.get("/campeonato/{tipo_campeonato_id}/{nch}", response_model=List[ResultadoResponse])
def obtener_resultados_por_campeonato(tipo_campeonato_id: int, nch: int, db: Session = Depends(get_db)):
    """
    Obtener todos los resultados de un campeonato específico
    """
    resultados = db.query(Resultado).filter(
        Resultado.tipo_campeonato_id == tipo_campeonato_id,
        Resultado.nch == nch
    ).all()
    
    return resultados

@router.put("/{nch}/{fecha_campeonato}/{idfed_jugador}", response_model=ResultadoResponse)
def actualizar_resultado(
    nch: int, 
    fecha_campeonato: date, 
    idfed_jugador: str, 
    resultado_update: ResultadoUpdate, 
    db: Session = Depends(get_db)
):
    """
    Actualizar un resultado existente
    """
    # Buscar el resultado
    resultado = db.query(Resultado).filter(
        Resultado.nch == nch,
        Resultado.fecha_campeonato == fecha_campeonato,
        Resultado.idfed_jugador == idfed_jugador
    ).first()
    
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    
    # Si se proporciona un nuevo tipo de campeonato, verificar que existe
    if resultado_update.tipo_campeonato_id is not None:
        tipo_campeonato = db.query(TipoCampeonato).filter(TipoCampeonato.id == resultado_update.tipo_campeonato_id).first()
        if not tipo_campeonato:
            raise HTTPException(status_code=404, detail="Tipo de campeonato no encontrado")
    
    # Actualizar los campos proporcionados
    update_data = resultado_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(resultado, key, value)
    
    try:
        db.commit()
        db.refresh(resultado)
        return resultado
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{nch}/{fecha_campeonato}/{idfed_jugador}", response_model=ResultadoResponse)
def eliminar_resultado(
    nch: int, 
    fecha_campeonato: date, 
    idfed_jugador: str, 
    db: Session = Depends(get_db)
):
    """
    Eliminar un resultado específico
    """
    # Buscar el resultado
    resultado = db.query(Resultado).filter(
        Resultado.nch == nch,
        Resultado.fecha_campeonato == fecha_campeonato,
        Resultado.idfed_jugador == idfed_jugador
    ).first()
    
    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")
    
    try:
        # Guardar los datos del resultado antes de eliminarlo para retornarlos
        resultado_eliminado = ResultadoResponse.from_orm(resultado)
        # Eliminar el resultado
        db.delete(resultado)
        db.commit()
        return resultado_eliminado
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al eliminar el resultado: {str(e)}") 