from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from ..models.tipo_campeonato import TipoCampeonato
from ..schemas.tipo_campeonato import TipoCampeonatoCreate, TipoCampeonatoResponse, TipoCampeonatoUpdate

router = APIRouter(
    prefix="/tipos-campeonato",
    tags=["tipos-campeonato"]
)

@router.post("/", response_model=TipoCampeonatoResponse)
def crear_tipo_campeonato(tipo_campeonato: TipoCampeonatoCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo tipo de campeonato
    """
    # Verificar si ya existe un tipo de campeonato con el mismo código
    db_tipo_campeonato = db.query(TipoCampeonato).filter(TipoCampeonato.codigo == tipo_campeonato.codigo).first()
    if db_tipo_campeonato:
        raise HTTPException(status_code=400, detail=f"Ya existe un tipo de campeonato con el código {tipo_campeonato.codigo}")
    
    nuevo_tipo_campeonato = TipoCampeonato(
        codigo=tipo_campeonato.codigo,
        nombre=tipo_campeonato.nombre,
        descripcion=tipo_campeonato.descripcion
    )
    
    try:
        db.add(nuevo_tipo_campeonato)
        db.commit()
        db.refresh(nuevo_tipo_campeonato)
        return nuevo_tipo_campeonato
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[TipoCampeonatoResponse])
def listar_tipos_campeonatos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Listar todos los tipos de campeonatos
    """
    # Restaurar la consulta original a la base de datos
    return db.query(TipoCampeonato).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=TipoCampeonatoResponse)
def obtener_tipo_campeonato(id: int, db: Session = Depends(get_db)):
    """
    Obtener un tipo de campeonato por su ID
    """
    tipo_campeonato = db.query(TipoCampeonato).filter(TipoCampeonato.id == id).first()
    if not tipo_campeonato:
        raise HTTPException(status_code=404, detail="Tipo de campeonato no encontrado")
    return tipo_campeonato

@router.get("/codigo/{codigo}", response_model=TipoCampeonatoResponse)
def obtener_tipo_campeonato_por_codigo(codigo: str, db: Session = Depends(get_db)):
    """
    Obtener un tipo de campeonato por su código
    """
    tipo_campeonato = db.query(TipoCampeonato).filter(TipoCampeonato.codigo == codigo).first()
    if not tipo_campeonato:
        raise HTTPException(status_code=404, detail="Tipo de campeonato no encontrado")
    return tipo_campeonato

@router.delete("/{id}", response_model=TipoCampeonatoResponse)
def eliminar_tipo_campeonato(id: int, db: Session = Depends(get_db)):
    """
    Eliminar un tipo de campeonato por su ID
    """
    # Buscar el tipo de campeonato
    tipo_campeonato = db.query(TipoCampeonato).filter(TipoCampeonato.id == id).first()
    if not tipo_campeonato:
        raise HTTPException(status_code=404, detail="Tipo de campeonato no encontrado")
    
    try:
        # Guardar los datos del tipo de campeonato antes de eliminarlo para retornarlos
        tipo_campeonato_eliminado = TipoCampeonatoResponse.from_orm(tipo_campeonato)
        # Eliminar el tipo de campeonato
        db.delete(tipo_campeonato)
        db.commit()
        return tipo_campeonato_eliminado
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al eliminar el tipo de campeonato: {str(e)}")

@router.patch("/{id}", response_model=TipoCampeonatoResponse)
def actualizar_tipo_campeonato(id: int, tipo_update: TipoCampeonatoUpdate, db: Session = Depends(get_db)):
    """
    Actualizar un tipo de campeonato existente por ID
    """
    # Buscar el tipo de campeonato existente
    db_tipo = db.query(TipoCampeonato).filter(TipoCampeonato.id == id).first()
    if not db_tipo:
        raise HTTPException(status_code=404, detail="Tipo de campeonato no encontrado")

    # Obtener los datos a actualizar del schema, excluyendo los no establecidos
    update_data = tipo_update.model_dump(exclude_unset=True)

    # Validar si el código se está actualizando y si ya existe
    if 'codigo' in update_data and update_data['codigo'] != db_tipo.codigo:
        existing_code = db.query(TipoCampeonato).filter(TipoCampeonato.codigo == update_data['codigo']).first()
        if existing_code:
            raise HTTPException(status_code=400, detail=f"Ya existe un tipo de campeonato con el código {update_data['codigo']}")

    # Actualizar los campos del objeto de base de datos
    for key, value in update_data.items():
        setattr(db_tipo, key, value)

    try:
        db.commit()
        db.refresh(db_tipo)
        return db_tipo
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error al actualizar el tipo de campeonato: {str(e)}") 