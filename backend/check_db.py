import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Agregar el directorio actual al path para poder importar los módulos
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Cargar variables de entorno
load_dotenv()

# Obtener la URL de la base de datos desde las variables de entorno
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL no está configurada en las variables de entorno")
    sys.exit(1)

try:
    # Crear el motor de la base de datos
    engine = create_engine(DATABASE_URL)
    
    # Crear la sesión
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Verificar la conexión a la base de datos
    print("Intentando conectar a la base de datos...")
    db.execute(text("SELECT 1"))
    print("Conexión exitosa a la base de datos.")
    
    # Verificar si existen tablas en la base de datos
    print("\nTablas en la base de datos:")
    result = db.execute(text("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """))
    tables = [row[0] for row in result]
    
    if not tables:
        print("No se encontraron tablas en la base de datos.")
    else:
        for table in tables:
            print(f"- {table}")
            
            # Contar registros en cada tabla
            count_result = db.execute(text(f"SELECT COUNT(*) FROM {table}"))
            count = count_result.scalar()
            print(f"  Registros: {count}")
            
            # Mostrar algunos registros de ejemplo si hay datos
            if count > 0:
                sample_result = db.execute(text(f"SELECT * FROM {table} LIMIT 3"))
                columns = sample_result.keys()
                rows = sample_result.fetchall()
                
                print(f"  Ejemplo de datos:")
                for row in rows:
                    row_dict = {col: val for col, val in zip(columns, row)}
                    print(f"    {row_dict}")
            
            print()
    
except Exception as e:
    print(f"Error al conectar a la base de datos: {str(e)}")
    sys.exit(1)
finally:
    db.close() 