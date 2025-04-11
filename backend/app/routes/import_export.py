import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse
import aiofiles
from pathlib import Path

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

# Aquí podrías añadir más endpoints relacionados, como el de descarga
# @router.get("/download-template")
# async def download_club_template():
#    # Lógica para servir el archivo TEMPLATE_PATH
#    pass 