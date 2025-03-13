from sqlalchemy.orm import Session
from ..models.tipo_campeonato import TipoCampeonato

# Tipos de campeonatos predefinidos
TIPOS_CAMPEONATOS = [
    {
        "codigo": "DP",
        "nombre": "Dominó Parejas",
        "descripcion": "Campeonato de dominó por parejas"
    },
    {
        "codigo": "DI",
        "nombre": "Dominó Individual",
        "descripcion": "Campeonato de dominó individual"
    },
    {
        "codigo": "RP",
        "nombre": "Rueda Parejas",
        "descripcion": "Campeonato de rueda por parejas"
    },
    {
        "codigo": "RI",
        "nombre": "Rueda Individual",
        "descripcion": "Campeonato de rueda individual"
    },
    {
        "codigo": "LI",
        "nombre": "Liga",
        "descripcion": "Campeonato de liga"
    }
]

def init_tipos_campeonatos(db: Session):
    """
    Inicializa los tipos de campeonatos en la base de datos
    """
    # Verificar si ya existen tipos de campeonatos
    existing_tipos = db.query(TipoCampeonato).all()
    if existing_tipos:
        # No mostrar ningún mensaje
        return
    
    # Crear los tipos de campeonatos
    for tipo_data in TIPOS_CAMPEONATOS:
        tipo = TipoCampeonato(**tipo_data)
        db.add(tipo)
    
    db.commit()
    # No mostrar ningún mensaje 