import os
import shutil
import pandas as pd
from io import BytesIO
from typing import List, Dict, Any

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import aiofiles
from pathlib import Path

# Importaciones locales (¡asegúrate de que las rutas sean correctas!)
from ..db.session import get_db
from ..models.club import Club  # Asume que tu modelo está aquí
from ..schemas.club import ClubCreate, ClubUpdate # Asume que tienes estos esquemas

# Definimos el router para las rutas de importación/exportación
router = APIRouter()

# Definimos la ubicación donde se guardará la plantilla
TEMPLATE_DIR = Path("app/templates")
TEMPLATE_FILENAME = "club_template.xlsx" # Nombre fijo para la plantilla
TEMPLATE_PATH = TEMPLATE_DIR / TEMPLATE_FILENAME

@router.post("/upload-template", status_code=status.HTTP_200_OK)
async def upload_club_template(file: UploadFile = File(...)):
    """
    Recibe un archivo Excel (.xlsx o .xls) y lo guarda como la plantilla
    oficial para la importación de clubs. Sobrescribe cualquier plantilla anterior.
    """
    # Asegurarnos de que el directorio de plantillas exista
    TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

    # Validar tipo de archivo (content type)
    allowed_content_types = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", # .xlsx
        "application/vnd.ms-excel" # .xls
    ]
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no válido: {file.content_type}. Se requiere un archivo Excel (.xlsx o .xls)."
        )

    try:
        # Guardar el archivo de forma asíncrona usando aiofiles
        # Lo guardamos en modo escritura binaria ('wb')
        async with aiofiles.open(TEMPLATE_PATH, 'wb') as out_file:
            while content := await file.read(1024 * 1024): # Leer en chunks de 1MB
                await out_file.write(content)
    except Exception as e:
        # Capturar cualquier error durante la escritura del archivo
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo guardar la plantilla: {e}"
        )
    finally:
        # Asegurarnos de cerrar el archivo subido
        await file.close()

    # Devolver un mensaje de éxito
    return {"message": f"Plantilla '{TEMPLATE_FILENAME}' guardada correctamente en {TEMPLATE_DIR}."}

# ---- Nuevo Endpoint para Descargar Plantilla ----
@router.get("/download-template")
async def download_club_template():
    """
    Permite descargar el archivo de plantilla de clubs existente.
    Devuelve un 404 si la plantilla no existe.
    """
    # Verificar si el archivo de plantilla existe
    if not TEMPLATE_PATH.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La plantilla '{TEMPLATE_FILENAME}' no se encontró en el servidor."
        )
    
    # Devolver el archivo usando FileResponse
    # FastAPI se encarga de las cabeceras (Content-Type, Content-Disposition)
    return FileResponse(
        path=TEMPLATE_PATH,
        filename=TEMPLATE_FILENAME, # Nombre que verá el usuario al descargar
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

# ---- Fin Nuevo Endpoint ----

# ---- Nuevo Endpoint para Importar Clubs desde Excel ----
@router.post("/clubs", status_code=status.HTTP_200_OK)
async def import_clubs_from_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importa clubs desde un archivo Excel (.xlsx, .xls).
    Valida los datos (CP, Numero Club) y crea o actualiza clubs en la BD.
    Devuelve un resumen o una lista de errores de validación.
    """
    # 1. Validar tipo de archivo
    allowed_content_types = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", # .xlsx
        "application/vnd.ms-excel" # .xls
    ]
    if file.content_type not in allowed_content_types:
        await file.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no válido: {file.content_type}. Se requiere un archivo Excel (.xlsx o .xls)."
        )

    # 2. Leer contenido del archivo en memoria
    try:
        content = await file.read()
        df = pd.read_excel(BytesIO(content))
    except Exception as e:
        await file.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al leer el archivo Excel: {e}"
        )
    finally:
        await file.close()

    # 3. Validar nombres de columnas esperadas
    expected_columns = [
        'Nombre del Club', 'CP', 'Número Club', 'Persona de contacto',
        'Teléfono', 'Dirección', 'Email'
    ]
    if not all(col in df.columns for col in expected_columns):
        missing_cols = [col for col in expected_columns if col not in df.columns]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Columnas faltantes en el archivo Excel: {', '.join(missing_cols)}"
        )

    # 4. Validación de datos fila por fila
    validation_errors: List[Dict[str, Any]] = []
    clubs_to_process: List[Dict[str, Any]] = []
    # Convertir CP y Numero Club a string para facilitar validación y unión
    df['CP'] = df['CP'].astype(str)
    df['Número Club'] = df['Número Club'].astype(str)

    for index, row in df.iterrows():
        errors_in_row = []
        row_number = index + 2 # +1 por índice base 0, +1 por cabecera

        cp_str = str(row['CP']).strip()
        num_club_str = str(row['Número Club']).strip()

        # Validar CP
        if not cp_str.isdigit() or not (1 <= len(cp_str) <= 2):
            errors_in_row.append(f"CP inválido ('{cp_str}') - debe ser 1 o 2 dígitos numéricos.")

        # Validar Numero Club
        if not num_club_str.isdigit() or not (1 <= len(num_club_str) <= 4):
            errors_in_row.append(f"Número Club inválido ('{num_club_str}') - debe ser entre 1 y 4 dígitos numéricos.")

        if errors_in_row:
            validation_errors.append({"fila": row_number, "errores": errors_in_row})
        else:
            # Construir codigo_club (ej: CP=7 -> 07, Num=12 -> 0012 => 070012)
            codigo_club = cp_str.zfill(2) + num_club_str.zfill(4)
            clubs_to_process.append({
                "codigo_club": codigo_club,
                "nombre": str(row['Nombre del Club']).strip(),
                "cp": cp_str,
                "numero_club": num_club_str,
                "persona_contacto": str(row['Persona de contacto']).strip() if pd.notna(row['Persona de contacto']) else None,
                "telefono": str(row['Teléfono']).strip() if pd.notna(row['Teléfono']) else None,
                "direccion": str(row['Dirección']).strip() if pd.notna(row['Dirección']) else None,
                "email": str(row['Email']).strip() if pd.notna(row['Email']) else None,
                "excel_row": row_number # Para referencia
            })

    # 5. Si hay errores de validación, devolverlos
    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"mensaje": "Se encontraron errores de validación en el archivo.", "errores": validation_errors}
        )

    # 6. Procesamiento en Base de Datos (si no hay errores)
    created_count = 0
    updated_count = 0
    update_details = []

    try:
        for club_data in clubs_to_process:
            db_club = db.query(Club).filter(Club.codigo_club == club_data["codigo_club"]).first()

            if db_club:
                # Club existe -> Actualizar si es necesario
                updated_fields = []
                update_data = ClubUpdate(
                    nombre=club_data["nombre"],
                    persona_contacto=club_data["persona_contacto"],
                    telefono=club_data["telefono"],
                    direccion=club_data["direccion"],
                    email=club_data["email"]
                    # CP y Numero Club no se actualizan ya que forman la clave
                )
                
                # Comparamos campo a campo (ignorando None si no hay valor)
                if db_club.nombre != update_data.nombre:
                    db_club.nombre = update_data.nombre
                    updated_fields.append("nombre")
                if db_club.persona_contacto != update_data.persona_contacto and update_data.persona_contacto is not None:
                    db_club.persona_contacto = update_data.persona_contacto
                    updated_fields.append("persona_contacto")
                if db_club.telefono != update_data.telefono and update_data.telefono is not None:
                    db_club.telefono = update_data.telefono
                    updated_fields.append("telefono")
                if db_club.direccion != update_data.direccion and update_data.direccion is not None:
                    db_club.direccion = update_data.direccion
                    updated_fields.append("direccion")
                if db_club.email != update_data.email and update_data.email is not None:
                    db_club.email = update_data.email
                    updated_fields.append("email")

                if updated_fields:
                    updated_count += 1
                    update_details.append(f"{db_club.nombre} ({club_data['codigo_club']}): {', '.join(updated_fields)}")
                    # Marcamos para actualizar, commit se hará al final
                    db.add(db_club) 
            else:
                # Club no existe -> Crear
                new_club_data = ClubCreate(
                    codigo_club=club_data["codigo_club"],
                    nombre=club_data["nombre"],
                    cp=club_data["cp"],
                    numero_club=club_data["numero_club"],
                    persona_contacto=club_data["persona_contacto"],
                    telefono=club_data["telefono"],
                    direccion=club_data["direccion"],
                    email=club_data["email"]
                )
                new_db_club = Club(**new_club_data.model_dump())
                db.add(new_db_club)
                created_count += 1

        # Commit final si todo fue bien
        db.commit()

    except Exception as e:
        db.rollback() # Revertir cambios en caso de error durante el procesamiento
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar los datos en la base de datos: {e}"
        )

    # 7. Devolver respuesta de éxito
    return {
        "message": "Importación de clubs completada.",
        "creados": created_count,
        "actualizados": updated_count,
        "detalles_actualizacion": update_details
    }

# ---- Fin Nuevo Endpoint ----

# Aquí podrías añadir más endpoints relacionados, como el de descarga
# @router.get("/download-template")
# async def download_club_template():
#    # Lógica para servir el archivo TEMPLATE_PATH
#    pass 