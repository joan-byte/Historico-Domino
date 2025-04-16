from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from datetime import date
from ..db.session import get_db
from ..models.resultado import Resultado
from ..models.jugador import Jugador
from ..models.club import Club
from ..models.tipo_campeonato import TipoCampeonato
from ..schemas.resultado import ResultadoCreate, ResultadoResponse, ResultadoUpdate
from pydantic import BaseModel, field_validator
from sqlalchemy import and_, or_
from sqlalchemy.types import String

router = APIRouter(
    prefix="/resultados",
    tags=["resultados"]
)

# --- Schemas para Filtros Dinámicos --- 
class FilterCondition(BaseModel):
    field: str  # Nombre del campo en el modelo Resultado (ej. 'idfed_jugador')
    operator: str # Operador ('eq', 'contains', 'gt', 'lt', 'between', etc.)
    value: Any    # Valor para el filtro (puede ser str, int, date, list[date], etc.)

class FilterRequest(BaseModel):
    filters: List[FilterCondition] = [] # Lista de condiciones a aplicar (con AND)
    skip: int = 0
    limit: int = 100
    # TODO: Añadir sort_by: Optional[str] = None, sort_dir: Optional[str] = 'asc'

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

@router.post("/filtrar", response_model=ResultadosPaginadosResponse)
def filtrar_resultados(request: FilterRequest, db: Session = Depends(get_db)):
    """
    Listar resultados con filtros dinámicos y paginación.
    Acepta una lista de condiciones de filtro en el cuerpo de la petición.
    Todas las condiciones se aplican con AND.
    """
    query = db.query(Resultado)
    
    # Aplicar filtros dinámicos
    filter_conditions = []
    allowed_fields = {f.name for f in Resultado.__table__.columns} # Campos permitidos
    
    for condition in request.filters:
        field_name = condition.field
        operator = condition.operator
        value = condition.value
        
        if field_name not in allowed_fields:
            raise HTTPException(status_code=400, detail=f"Campo de filtro no válido: {field_name}")
            
        column = getattr(Resultado, field_name, None)
        if column is None:
             raise HTTPException(status_code=400, detail=f"Campo de filtro no encontrado en el modelo: {field_name}")

        # ---- Lógica de construcción de filtro CORREGIDA ----
        try:
            is_date_field = (field_name == 'fecha_campeonato') # Comprobación explícita
            
            if operator == 'eq':
                # Solo convertir a fecha si ES el campo de fecha y el valor es string
                if is_date_field and isinstance(value, str):
                    try:
                        value = date.fromisoformat(value)
                    except ValueError:
                         raise ValueError(f"Formato de fecha inválido para eq: {value}")
                filter_conditions.append(column == value)
                
            elif operator == 'contains' and isinstance(column.type, String):
                 # Asegurarse que 'contains' solo se aplica a strings
                filter_conditions.append(column.contains(str(value)))
                
            elif operator == 'gt' and hasattr(column, '__gt__'):
                 # Solo convertir a fecha si ES el campo de fecha
                 if is_date_field and isinstance(value, str):
                     try:
                         value = date.fromisoformat(value)
                     except ValueError:
                         raise ValueError(f"Formato de fecha inválido para gt: {value}")
                 filter_conditions.append(column > value)
                 
            elif operator == 'lt' and hasattr(column, '__lt__'):
                 # Solo convertir a fecha si ES el campo de fecha
                 if is_date_field and isinstance(value, str):
                     try:
                         value = date.fromisoformat(value)
                     except ValueError:
                         raise ValueError(f"Formato de fecha inválido para lt: {value}")
                 filter_conditions.append(column < value)
                 
            elif operator == 'after' and is_date_field: # Operador solo para fechas
                 if isinstance(value, str):
                     try:
                         value = date.fromisoformat(value)
                     except ValueError:
                         raise ValueError(f"Formato de fecha inválido para after: {value}")
                 filter_conditions.append(column >= value) # >= para incluir el día
                 
            elif operator == 'before' and is_date_field: # Operador solo para fechas
                 if isinstance(value, str):
                     try:
                         value = date.fromisoformat(value)
                     except ValueError:
                          raise ValueError(f"Formato de fecha inválido para before: {value}")
                 filter_conditions.append(column <= value) # <= para incluir el día
                 
            elif operator == 'between' and hasattr(column, 'between'):
                if not isinstance(value, list) or len(value) != 2:
                    raise ValueError("El operador 'between' requiere una lista con dos valores.")
                val1, val2 = value[0], value[1]
                # Convertir a fecha SOLO si es el campo de fecha
                if is_date_field:
                     try:
                         val1 = date.fromisoformat(val1) if isinstance(val1, str) else val1
                         val2 = date.fromisoformat(val2) if isinstance(val2, str) else val2
                     except ValueError:
                         raise ValueError(f"Formato de fecha inválido para between: {val1} o {val2}")
                filter_conditions.append(column.between(val1, val2))
                
            # Añadir más operadores aquí si es necesario (gte, lte, startswith, endswith)
            
            else:
                # Si el operador no es reconocido O no aplica al tipo de campo
                if operator == 'contains' and not isinstance(column.type, String):
                     raise HTTPException(status_code=400, detail=f"Operador 'contains' solo aplica a campos de texto.")
                # Añadir otras validaciones de operador/tipo aquí
                else:
                     raise HTTPException(status_code=400, detail=f"Operador no soportado o inválido: '{operator}' para el campo '{field_name}'")
                     
        except ValueError as e:
             # Captura ValueErrors de conversiones (fecha, número si se añade)
             raise HTTPException(status_code=400, detail=f"Valor inválido para el filtro {field_name} {operator}: {str(e)}")
        except Exception as e:
             # Captura genérica para otros errores inesperados
             raise HTTPException(status_code=500, detail=f"Error interno al procesar el filtro {field_name} {operator}: {str(e)}")

    # Aplicar todas las condiciones con AND
    if filter_conditions:
        query = query.filter(and_(*filter_conditions))

    # Contar el total DESPUÉS de aplicar filtros
    total_resultados = query.count()
    
    # Aplicar paginación y ordenar (mantener orden por defecto)
    resultados_pagina = query.order_by(Resultado.fecha_campeonato.desc(), Resultado.nch.desc()).offset(request.skip).limit(request.limit).all()
    
    return ResultadosPaginadosResponse(total=total_resultados, resultados=resultados_pagina)

@router.get("/", response_model=ResultadosPaginadosResponse, deprecated=True)
def listar_resultados(
    skip: int = 0, 
    limit: int = 100, 
    tipo_campeonato_id: Optional[int] = Query(None, description="Filtrar por ID de tipo de campeonato"),
    fecha_desde: Optional[date] = Query(None, description="Fecha de inicio del rango (incluida)"),
    fecha_hasta: Optional[date] = Query(None, description="Fecha de fin del rango (incluida)"),
    idfed_jugador: Optional[str] = Query(None, description="Filtrar por IDFED del jugador principal"),
    campeonato_nch: Optional[str] = Query(None, description="Filtrar por NCH del campeonato"),
    codigo_club_jugador: Optional[str] = Query(None, description="Filtrar por código del club del jugador principal"),
    db: Session = Depends(get_db)
):
    """
    **OBSOLETA:** Usar POST /filtrar para filtros avanzados.
    Listar resultados con filtros básicos y paginación.
    """
    query = db.query(Resultado)
    
    # Aplicar filtros si se proporcionan
    if tipo_campeonato_id is not None:
        query = query.filter(Resultado.tipo_campeonato_id == tipo_campeonato_id)
    if fecha_desde:
        query = query.filter(Resultado.fecha_campeonato >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Resultado.fecha_campeonato <= fecha_hasta)
    if idfed_jugador:
        query = query.filter(Resultado.idfed_jugador == idfed_jugador)
    if campeonato_nch:
        query = query.filter(Resultado.campeonato_nch == campeonato_nch)
    if codigo_club_jugador:
        query = query.filter(Resultado.codigo_club_jugador == codigo_club_jugador)

    # Contar el total DESPUÉS de aplicar filtros
    total_resultados = query.count()
    
    # Aplicar paginación y ordenar (opcional, pero bueno para consistencia)
    # Por ejemplo, ordenar por fecha de campeonato descendente y luego por NCH
    resultados_pagina = query.order_by(Resultado.fecha_campeonato.desc(), Resultado.nch.desc()).offset(skip).limit(limit).all()
    
    return ResultadosPaginadosResponse(total=total_resultados, resultados=resultados_pagina) 