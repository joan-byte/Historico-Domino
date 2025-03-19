from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..db.session import get_db
from ..models.campeonato import Campeonato
from ..schemas.campeonato import CampeonatoCreate, CampeonatoUpdate, Campeonato as CampeonatoSchema

router = APIRouter(
    prefix="/api/campeonatos",
    tags=["campeonatos"]
)

@router.get("/", response_model=List[CampeonatoSchema])
def get_campeonatos(db: Session = Depends(get_db)):
    """Obtener todos los campeonatos"""
    return db.query(Campeonato).all()

@router.get("/{campeonato_id}", response_model=CampeonatoSchema)
def get_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    """Obtener un campeonato por ID"""
    campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
    if not campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    return campeonato

@router.post("/", response_model=CampeonatoSchema, status_code=status.HTTP_201_CREATED)
def create_campeonato(campeonato: CampeonatoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo campeonato"""
    db_campeonato = Campeonato(**campeonato.dict())
    db.add(db_campeonato)
    db.commit()
    db.refresh(db_campeonato)
    return db_campeonato

@router.put("/{campeonato_id}", response_model=CampeonatoSchema)
def update_campeonato(
    campeonato_id: int,
    campeonato: CampeonatoUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un campeonato"""
    db_campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
    if not db_campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    
    for key, value in campeonato.dict(exclude_unset=True).items():
        setattr(db_campeonato, key, value)
    
    db.commit()
    db.refresh(db_campeonato)
    return db_campeonato

@router.delete("/{campeonato_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campeonato(campeonato_id: int, db: Session = Depends(get_db)):
    """Eliminar un campeonato"""
    db_campeonato = db.query(Campeonato).filter(Campeonato.id == campeonato_id).first()
    if not db_campeonato:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campeonato no encontrado"
        )
    
    db.delete(db_campeonato)
    db.commit()
    return None 