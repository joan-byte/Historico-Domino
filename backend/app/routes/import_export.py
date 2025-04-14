import os
import shutil
import pandas as pd
from io import BytesIO
from typing import List, Dict, Any
import unicodedata
import re

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session
import aiofiles
from pathlib import Path

# Importaciones locales (¡asegúrate de que las rutas sean correctas!)
from ..db.session import get_db
from ..models.club import Club  # Asume que tu modelo está aquí
from ..schemas.club import ClubCreate, ClubUpdate # Asume que tienes estos esquemas
from ..models.jugador import Jugador  # Asume que tu modelo está aquí
from ..schemas.jugador import JugadorCreate, JugadorUpdate  # Asume que tienes estos esquemas
from ..models.resultado import Resultado
from ..schemas.resultado import ResultadoCreate
from ..models.tipo_campeonato import TipoCampeonato # Necesario para validar tipo_campeonato_id

# Definimos el router para las rutas de importación/exportación
router = APIRouter()

# ---- Definiciones de Plantillas ----
TEMPLATE_DIR = Path("app/templates")

# Plantilla de Clubs
CLUB_TEMPLATE_FILENAME = "club_template.xlsx"
CLUB_TEMPLATE_PATH = TEMPLATE_DIR / CLUB_TEMPLATE_FILENAME

# Plantilla de Jugadores
PLAYER_TEMPLATE_FILENAME = "player_template.xlsx"
PLAYER_TEMPLATE_PATH = TEMPLATE_DIR / PLAYER_TEMPLATE_FILENAME

# Plantilla de Resultados
RESULTADO_TEMPLATE_FILENAME = "resultado_template.xlsx"
RESULTADO_TEMPLATE_PATH = TEMPLATE_DIR / RESULTADO_TEMPLATE_FILENAME
# ---- Fin Definiciones de Plantillas ----

# --- Función auxiliar para normalizar cadenas ---
def normalize_string(s: str) -> str:
    """Convierte a minúsculas, quita acentos y espacios extra."""
    if not isinstance(s, str):
        return str(s) # Devolver como string si no lo es
    s = s.strip().lower() # Minúsculas y quitar espacios de los extremos
    s = re.sub(r'\s+', ' ', s) # Reemplazar múltiples espacios internos por uno solo
    # Quitar acentos
    s = ''.join(c for c in unicodedata.normalize('NFD', s)
                if unicodedata.category(c) != 'Mn')
    return s
# --- Fin función auxiliar ---

# ---- Gestión Plantilla Clubs ----
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
        # Usar CLUB_TEMPLATE_PATH para guardar
        async with aiofiles.open(CLUB_TEMPLATE_PATH, 'wb') as out_file:
            while content := await file.read(1024 * 1024): # Leer en chunks de 1MB
                await out_file.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo guardar la plantilla de clubs: {e}"
        )
    finally:
        await file.close()

    # Devolver un mensaje de éxito
    return {"message": f"Plantilla de clubs '{CLUB_TEMPLATE_FILENAME}' guardada correctamente en {TEMPLATE_DIR}."}

@router.get("/download-template")
async def download_club_template():
    """
    Permite descargar el archivo de plantilla de clubs existente.
    Devuelve un 404 si la plantilla no existe.
    """
    # Usar CLUB_TEMPLATE_PATH para verificar
    if not CLUB_TEMPLATE_PATH.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La plantilla de clubs '{CLUB_TEMPLATE_FILENAME}' no se encontró."
        )
    
    # Devolver el archivo
    return FileResponse(
        path=CLUB_TEMPLATE_PATH,
        filename=CLUB_TEMPLATE_FILENAME,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
# ---- Fin Gestión Plantilla Clubs ----


# ---- Gestión Plantilla Jugadores ----
@router.post("/upload-player-template", status_code=status.HTTP_200_OK)
async def upload_player_template(file: UploadFile = File(...)):
    """
    Recibe un archivo Excel (.xlsx o .xls) y lo guarda como la plantilla
    oficial para la importación de jugadores. Sobrescribe cualquier plantilla anterior.
    """
    TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

    allowed_content_types = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
    ]
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no válido: {file.content_type}. Se requiere un archivo Excel (.xlsx o .xls)."
        )

    try:
        # Usar PLAYER_TEMPLATE_PATH para guardar
        async with aiofiles.open(PLAYER_TEMPLATE_PATH, 'wb') as out_file:
            while content := await file.read(1024 * 1024):
                await out_file.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo guardar la plantilla de jugadores: {e}"
        )
    finally:
        await file.close()

    return {"message": f"Plantilla de jugadores '{PLAYER_TEMPLATE_FILENAME}' guardada correctamente en {TEMPLATE_DIR}."}

@router.get("/download-player-template")
async def download_player_template():
    """
    Permite descargar el archivo de plantilla de jugadores existente.
    Devuelve un 404 si la plantilla no existe.
    """
    # Usar PLAYER_TEMPLATE_PATH para verificar
    if not PLAYER_TEMPLATE_PATH.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"La plantilla de jugadores '{PLAYER_TEMPLATE_FILENAME}' no se encontró."
        )
    
    # Devolver el archivo
    return FileResponse(
        path=PLAYER_TEMPLATE_PATH,
        filename=PLAYER_TEMPLATE_FILENAME,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
# ---- Fin Gestión Plantilla Jugadores ----


# ---- Gestión Plantilla Resultados ----
@router.post("/resultados/upload-template", status_code=status.HTTP_200_OK)
async def upload_resultado_template(file: UploadFile = File(...)):
    """
    Recibe un archivo Excel (.xlsx o .xls) y lo guarda como la plantilla
    oficial para la importación de resultados. Sobrescribe cualquier plantilla anterior.
    """
    TEMPLATE_DIR.mkdir(parents=True, exist_ok=True)

    allowed_content_types = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel"
    ]
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no válido: {file.content_type}. Se requiere un archivo Excel (.xlsx o .xls)."
        )

    try:
        # Usar RESULTADO_TEMPLATE_PATH para guardar
        async with aiofiles.open(RESULTADO_TEMPLATE_PATH, 'wb') as out_file:
            while content := await file.read(1024 * 1024): # Leer en chunks de 1MB
                await out_file.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No se pudo guardar la plantilla de resultados: {e}"
        )
    finally:
        await file.close()

    # Devolver un mensaje de éxito
    return {"message": f"Plantilla de resultados '{RESULTADO_TEMPLATE_FILENAME}' guardada correctamente en {TEMPLATE_DIR}."}

@router.get("/resultados/download-template")
async def download_resultado_template():
    """
    Permite descargar el archivo de plantilla de resultados existente.
    Devuelve un 404 si la plantilla no existe.
    """
    # Usar RESULTADO_TEMPLATE_PATH para verificar
    if not RESULTADO_TEMPLATE_PATH.is_file():
        # Si no existe, creamos una plantilla básica en memoria
        try:
            # Definir las cabeceras esperadas para la plantilla de resultados
            headers = [
                'NCH', 'Fecha Campeonato', 'IDFED Jugador', 'Nombre Jugador', 'Apellido Jugador', 
                'Club Jugador (Código)', 'IDFED Pareja', 'Nombre Pareja', 'Apellido Pareja', 
                'Club Pareja (Código)', 'Posición', 'Partida', 'Mesa', 'Grupo (A/B)', 
                'PG', 'DIF', 'PV', 'PT', 'MG'
            ]
            df_template = pd.DataFrame(columns=headers)
            
            # Crear un BytesIO buffer para guardar el DataFrame como Excel
            output = BytesIO()
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df_template.to_excel(writer, index=False, sheet_name='Resultados')
            output.seek(0) # Rebobinar el buffer al principio
            
            # Devolver el archivo Excel generado en memoria
            return Response(
                content=output.read(),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={ "Content-Disposition": f"attachment; filename={RESULTADO_TEMPLATE_FILENAME}" }
            )

        except Exception as e:
            # Si hay un error al generar la plantilla, devolver 500
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"No se pudo generar la plantilla de resultados: {e}"
            )
    
    # Si el archivo existe, devolverlo directamente
    return FileResponse(
        path=RESULTADO_TEMPLATE_PATH,
        filename=RESULTADO_TEMPLATE_FILENAME,
        media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
# ---- Fin Gestión Plantilla Resultados ----


# ---- Endpoint para Importar Clubs desde Excel ----
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
        # Intentar leer especificando UTF-8 podría ayudar, pero la normalización es más robusta
        df = pd.read_excel(BytesIO(content))

        # ---> DEBUGGING: Quitar impresión <---
        # print("--- Columnas leídas directamente de Excel ---")
        # print(df.columns.tolist()) 
        # print("---------------------------------------------")
        # ---> FIN DEBUGGING <---

    except Exception as e:
        await file.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al leer el archivo Excel: {e}"
        )
    finally:
        await file.close()

    # Guardar los nombres originales para mensajes de error más claros si es necesario
    original_columns = df.columns.tolist()
    # Normalizar las columnas del DataFrame leído
    df.columns = [normalize_string(col) for col in original_columns]
    normalized_df_columns = df.columns.tolist() # Columnas ya normalizadas

    # ---> DEBUGGING: Quitar impresión <---
    # print("--- Columnas después de la normalización ---")
    # print(normalized_df_columns)
    # print("-------------------------------------------")
    # ---> FIN DEBUGGING <---

    # 3. Validar nombres de columnas esperadas (también normalizados)
    expected_columns_original = [
        'Nombre del Club', 'CP', 'Número Club', 'Persona de contacto',
        'Teléfono', 'Dirección', 'Email'
    ]
    # Normalizamos las columnas esperadas para la comparación
    expected_columns_normalized = [normalize_string(col) for col in expected_columns_original]

    missing_normalized_cols = [
        expected for expected in expected_columns_normalized
        if expected not in normalized_df_columns
    ]

    if missing_normalized_cols:
        # Para el mensaje de error, encontramos los nombres originales correspondientes
        original_missing_map = {normalize_string(orig): orig for orig in expected_columns_original}
        missing_original_names = [original_missing_map.get(norm_miss, norm_miss) for norm_miss in missing_normalized_cols]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Columnas faltantes en el archivo Excel: {', '.join(missing_original_names)}"
        )

    # 4. Validación de datos fila por fila
    validation_errors: List[Dict[str, Any]] = []
    clubs_to_process: List[Dict[str, Any]] = []
    # Convertir CP y Numero Club a string (usando nombres normalizados)
    df['cp'] = df['cp'].astype(str)
    df['numero club'] = df['numero club'].astype(str)

    for index, row in df.iterrows():
        errors_in_row = []
        row_number = index + 2 # +1 por índice base 0, +1 por cabecera

        # Acceder usando nombres NORMALIZADOS
        cp_str = str(row['cp']).strip()
        num_club_str = str(row['numero club']).strip()
        nombre_club_str = str(row['nombre del club']).strip()
        persona_contacto_str = str(row['persona de contacto']).strip() if pd.notna(row['persona de contacto']) else None
        telefono_str = str(row['telefono']).strip() if pd.notna(row['telefono']) else None
        direccion_str = str(row['direccion']).strip() if pd.notna(row['direccion']) else None
        email_str = str(row['email']).strip() if pd.notna(row['email']) else None

        # Validar CP
        if not cp_str.isdigit() or not (1 <= len(cp_str) <= 2):
            errors_in_row.append(f"CP inválido ('{cp_str}') - debe ser 1 o 2 dígitos numéricos.")

        # Validar Numero Club
        if not num_club_str.isdigit() or not (1 <= len(num_club_str) <= 4):
            errors_in_row.append(f"Número Club inválido ('{num_club_str}') - debe ser entre 1 y 4 dígitos numéricos.")

        # Validar Nombre del Club (asegurarnos de que no esté vacío)
        if not nombre_club_str:
             errors_in_row.append("Nombre del Club no puede estar vacío.")

        if errors_in_row:
            validation_errors.append({"fila": row_number, "errores": errors_in_row, "nombre_original": nombre_club_str}) # Añadir nombre original para referencia
        else:
            # Construir codigo_club (ej: CP=7 -> 07, Num=12 -> 0012 => 070012)
            codigo_club = cp_str.zfill(2) + num_club_str.zfill(4)
            clubs_to_process.append({
                "codigo_club": codigo_club,
                "nombre": nombre_club_str, # Usar el nombre ya validado
                "cp": cp_str,
                "numero_club": num_club_str,
                "persona_contacto": persona_contacto_str, # Usar el valor ya procesado
                "telefono": telefono_str, # Usar el valor ya procesado
                "direccion": direccion_str, # Usar el valor ya procesado
                "email": email_str, # Usar el valor ya procesado
                "excel_row": row_number # Para referencia
            })

    # 5. Si hay errores de validación, devolverlos
    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            # Devolver un mensaje más detallado con la fila y el error
            detail={"mensaje": "Se encontraron errores de validación en el archivo.", "errores_detalle": validation_errors}
        )

    # 6. Procesamiento en Base de Datos (si no hay errores)
    created_count = 0
    updated_count = 0
    update_details = []
    created_details = [] # Para saber qué se creó

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
                )
                
                if db_club.nombre != update_data.nombre:
                    db_club.nombre = update_data.nombre
                    updated_fields.append("nombre")
                if db_club.persona_contacto != update_data.persona_contacto:
                    db_club.persona_contacto = update_data.persona_contacto
                    updated_fields.append("persona_contacto")
                if db_club.telefono != update_data.telefono:
                    db_club.telefono = update_data.telefono
                    updated_fields.append("telefono")
                if db_club.direccion != update_data.direccion:
                    db_club.direccion = update_data.direccion
                    updated_fields.append("direccion")
                if db_club.email != update_data.email:
                    db_club.email = update_data.email
                    updated_fields.append("email")

                if updated_fields:
                    updated_count += 1
                    update_details.append(f"{db_club.nombre} ({club_data['codigo_club']}): {', '.join(updated_fields)}")
                    db.add(db_club) 
            else:
                # Club no existe -> Crear
                
                # -- INICIO CORRECCIÓN ClubCreate --
                # ClubCreate no espera codigo_club, sino cp y numero_club
                new_club_data = ClubCreate(
                    # codigo_club=club_data["codigo_club"], # <-- Campo incorrecto
                    nombre=club_data["nombre"],
                    cp=club_data["cp"],                   # <-- Pasar CP
                    numero_club=club_data["numero_club"], # <-- Pasar Numero Club
                    persona_contacto=club_data["persona_contacto"],
                    telefono=club_data["telefono"],
                    direccion=club_data["direccion"],
                    email=club_data["email"]
                )
                # El modelo SQLAlchemy (Club) probablemente sí tenga codigo_club
                # y lo construirá internamente o esperará los campos individuales.
                # Asumimos que el modelo Club puede recibir los campos de ClubCreate.
                # new_db_club = Club(**new_club_data.model_dump()) 
                # --> CORRECCIÓN: Pasar explícitamente codigo_club al modelo Club
                new_db_club = Club(**new_club_data.model_dump(), codigo_club=club_data["codigo_club"])
                # -- FIN CORRECCIÓN ClubCreate --
                
                db.add(new_db_club)
                created_count += 1
                created_details.append(f"{new_club_data.nombre} (CP:{new_club_data.cp}, Num:{new_club_data.numero_club})") # Usar CP y Num para el detalle

        # Commit final si todo fue bien
        db.commit()

    except Exception as e:
        db.rollback() # Revertir cambios en caso de error durante el procesamiento
        # Loggear el error en el servidor también sería útil aquí
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar los datos en la base de datos: {e}"
        )

    # 7. Devolver resumen del proceso
    return {
        "mensaje": "Importación completada.",
        "clubs_creados": created_count,
        "clubs_actualizados": updated_count,
        "detalles_creados": created_details,
        "detalles_actualizados": update_details
    }

# ========= NUEVO ENDPOINT: IMPORTAR JUGADORES =========

@router.post("/players", status_code=status.HTTP_200_OK)
async def import_players_from_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importa jugadores desde un archivo Excel (.xlsx, .xls).
    Valida los datos, busca el club asociado, y crea o actualiza jugadores.
    Identifica jugadores existentes por IDFED o DNI.
    """
    # 1. Validar tipo de archivo (igual que para clubs)
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

    # 3. Normalización y Validación de Columnas
    original_columns = df.columns.tolist()
    df.columns = [normalize_string(col) for col in original_columns]
    normalized_df_columns = df.columns.tolist()

    # Columnas esperadas (basadas en la imagen y el modelo)
    expected_columns_original = [
        'Nombre', 'Apellidos', 'C.Club', 'CP', 'Número Jugador', 
        'DNI', 'Teléfono', 'Email'
    ]
    expected_columns_normalized = [normalize_string(col) for col in expected_columns_original]

    missing_normalized_cols = [
        expected for expected in expected_columns_normalized
        if expected not in normalized_df_columns
    ]

    if missing_normalized_cols:
        original_missing_map = {normalize_string(orig): orig for orig in expected_columns_original}
        missing_original_names = [original_missing_map.get(norm_miss, norm_miss) for norm_miss in missing_normalized_cols]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Columnas faltantes en el archivo Excel de jugadores: {', '.join(missing_original_names)}"
        )

    # 4. Validación de datos fila por fila
    validation_errors: List[Dict[str, Any]] = []
    players_to_process: List[Dict[str, Any]] = []

    # Convertir columnas relevantes a string para evitar problemas de tipo con pandas
    cols_to_str = ['cp', 'c.club', 'numero jugador', 'dni', 'telefono']
    for col in cols_to_str:
        if col in df.columns:
             df[col] = df[col].astype(str)

    for index, row in df.iterrows():
        errors_in_row = []
        row_number = index + 2 # +1 por índice base 0, +1 por cabecera

        # Extraer y limpiar datos (usando nombres normalizados)
        cp_jugador_str = str(row.get('cp', '')).strip() # CP del JUGADOR
        codigo_club_str = str(row.get('c.club', '')).strip() # CODIGO CLUB (6 dígitos)
        num_jugador_str = str(row.get('numero jugador', '')).strip() # Numero del JUGADOR
        nombre_str = str(row.get('nombre', '')).strip()
        apellidos_str = str(row.get('apellidos', '')).strip()
        dni_str = str(row.get('dni', '')).strip().upper() # DNI a mayúsculas
        telefono_str = str(row.get('telefono', '')).strip()
        email_str = str(row.get('email', '')).strip()

        # --- Validaciones Básicas --- 
        if not nombre_str: errors_in_row.append("Nombre no puede estar vacío.")
        if not apellidos_str: errors_in_row.append("Apellidos no pueden estar vacíos.")
        if not cp_jugador_str: errors_in_row.append("CP (Jugador) no puede estar vacío.")
        if not codigo_club_str: errors_in_row.append("C.Club (Codigo Club) no puede estar vacío.")
        if not num_jugador_str: errors_in_row.append("Número Jugador no puede estar vacío.")

        # Validar formato CP Jugador (2 dígitos)
        if not cp_jugador_str.isdigit() or len(cp_jugador_str) != 2:
            errors_in_row.append(f"CP (Jugador) inválido ('{cp_jugador_str}') - debe ser 2 dígitos numéricos.")
        # Validar formato Codigo Club (6 dígitos)
        if not codigo_club_str.isdigit() or len(codigo_club_str) != 6:
             errors_in_row.append(f"C.Club inválido ('{codigo_club_str}') - debe ser 6 dígitos numéricos (CPClub+NumClub).")
        # Validar formato Numero Jugador (1-4 dígitos)
        if not num_jugador_str.isdigit() or not (1 <= len(num_jugador_str) <= 4):
             errors_in_row.append(f"Número Jugador inválido ('{num_jugador_str}') - debe ser de 1 a 4 dígitos.")
        # Validar formato DNI (opcional, 8N+1L)
        dni_valido = False
        if dni_str:
            # --- INICIO CORRECCIÓN: Comprobar si es un DNI real antes de validar formato ---
            # Solo validar formato si no es 'NAN' (u otra representación de nulo)
            if dni_str != 'NAN': # Podríamos añadir más chequeos si otros nulos aparecen
                if len(dni_str) == 9 and dni_str[:-1].isdigit() and dni_str[-1].isalpha():
                    dni_valido = True
                else:
                    errors_in_row.append(f"DNI inválido ('{dni_str}') - debe tener 8 números y 1 letra.")
            # Si es 'NAN' o vacío, simplemente se ignora y dni_valido sigue False (se pasará None a la BD)
            # --- FIN CORRECCIÓN ---
        
        # Si hay errores hasta ahora, pasar a la siguiente fila
        if errors_in_row:
            validation_errors.append({"fila": row_number, "errores": errors_in_row})
            continue

        # --- Validación Avanzada (Existencia Club) ---
        db_club = db.query(Club).filter(Club.codigo_club == codigo_club_str).first()
        if not db_club:
            errors_in_row.append(f"Club con Código '{codigo_club_str}' (columna C.Club) no encontrado.")
            validation_errors.append({"fila": row_number, "errores": errors_in_row})
            continue 

        # --- Preparar Datos Jugador --- 
        idfed = cp_jugador_str.zfill(2) + num_jugador_str.zfill(4)
        
        player_data = {
            "idfed": idfed, # ID único del jugador
            "cp": cp_jugador_str, # CP propio del jugador
            "numero_jugador": num_jugador_str, # El número propio del jugador
            "nombre": nombre_str,
            "apellidos": apellidos_str,
            "codigo_club": codigo_club_str, # El código del club leído del Excel
            "dni": dni_str if dni_valido else None,
            "telefono": telefono_str if telefono_str else None,
            "email": email_str if email_str and email_str.lower() != 'nan' else None,
            "excel_row": row_number # Para referencia
        }
        players_to_process.append(player_data)

    # 5. Si hay errores de validación acumulados, devolverlos
    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"mensaje": "Se encontraron errores de validación en el archivo de jugadores.", "errores_detalle": validation_errors}
        )

    # 6. Procesamiento en Base de Datos (Crear o Actualizar)
    created_count = 0
    updated_count = 0
    skipped_count = 0 # Podríamos añadir lógica para saltar si se desea
    process_details = []

    try:
        for player_data in players_to_process:
            db_player = None
            # Buscar por IDFED primero
            db_player = db.query(Jugador).filter(Jugador.idfed == player_data["idfed"]).first()
            
            # Si no se encontró por IDFED y hay DNI válido, buscar por DNI
            if not db_player and player_data["dni"]:
                 db_player = db.query(Jugador).filter(Jugador.dni == player_data["dni"]).first()
                 # Ojo: si encuentra por DNI pero el IDFED es diferente, podría indicar un problema de datos
                 if db_player and db_player.idfed != player_data["idfed"]:
                     process_details.append(f"ADVERTENCIA Fila {player_data['excel_row']}: Jugador encontrado por DNI ({player_data['dni']}) pero IDFED no coincide ({db_player.idfed} vs {player_data['idfed']}). Se actualizará el existente.")
                     # Aquí podríamos decidir saltar o forzar la actualización.
                     # Por ahora, actualizaremos el encontrado por DNI.

            if db_player:
                # --- Jugador Existe -> Actualizar ---
                updated_fields = []
                # El schema JugadorUpdate espera nombre, apellidos, codigo_club.
                update_data = JugadorUpdate(
                    nombre=player_data["nombre"],
                    apellidos=player_data["apellidos"],
                    codigo_club=player_data["codigo_club"], # Pasamos el codigo_club leído
                    dni=player_data["dni"], 
                    telefono=player_data["telefono"],
                    email=player_data["email"]
                )
                
                # Comparamos campo a campo
                if db_player.nombre != update_data.nombre: db_player.nombre = update_data.nombre; updated_fields.append("nombre")
                if db_player.apellidos != update_data.apellidos: db_player.apellidos = update_data.apellidos; updated_fields.append("apellidos")
                if db_player.codigo_club != update_data.codigo_club: db_player.codigo_club = update_data.codigo_club; updated_fields.append("club") # Cambiar club
                if db_player.dni != update_data.dni: db_player.dni = update_data.dni; updated_fields.append("DNI")
                if db_player.telefono != update_data.telefono: db_player.telefono = update_data.telefono; updated_fields.append("teléfono")
                if db_player.email != update_data.email: db_player.email = update_data.email; updated_fields.append("email")

                if updated_fields:
                    updated_count += 1
                    process_details.append(f"Actualizado: {db_player.nombre} {db_player.apellidos} (IDFED: {db_player.idfed}) -> {updated_fields}")
                    db.add(db_player)
                else:
                    process_details.append(f"Sin cambios: {db_player.nombre} {db_player.apellidos} (IDFED: {db_player.idfed})")

            else:
                # --- Jugador No Existe -> Crear ---
                try:
                    # Usamos JugadorCreate, que también espera codigo_club
                    new_player_schema = JugadorCreate(
                        cp=player_data["cp"], # CP del jugador
                        numero_jugador=player_data["numero_jugador"],
                        nombre=player_data["nombre"],
                        apellidos=player_data["apellidos"],
                        codigo_club=player_data["codigo_club"], # Codigo club leído
                        dni=player_data["dni"],
                        telefono=player_data["telefono"],
                        email=player_data["email"]
                    )
                    # Creamos el objeto SQLAlchemy pasando también idfed
                    new_db_player = Jugador(**new_player_schema.model_dump(), idfed=player_data["idfed"])
                    db.add(new_db_player)
                    created_count += 1
                    process_details.append(f"Creado: {new_db_player.nombre} {new_db_player.apellidos} (IDFED: {new_db_player.idfed})")
                except ValueError as ve: # Capturar errores de validación de Pydantic/SQLAlchemy
                     # Si falla la creación (p.ej., DNI/Email duplicado no detectado antes, o validador del modelo)
                     db.rollback() # Deshacer add parcial
                     validation_errors.append({
                         "fila": player_data['excel_row'],
                         "errores": [f"Error al crear jugador con IDFED {player_data['idfed']}: {ve}"]
                     })
                     # Volver a lanzar la excepción si queremos detener todo el proceso
                     # raise HTTPException(status_code=400, detail={"mensaje": "Error al crear jugador", "errores_detalle": validation_errors})
                     # O continuar procesando los demás (con cuidado del rollback)
                     continue 

        # Si hubo errores durante la creación, devolverlos ahora
        if validation_errors:
             raise HTTPException(
                 status_code=status.HTTP_400_BAD_REQUEST,
                 detail={"mensaje": "Se encontraron errores durante el procesamiento de jugadores.", "errores_detalle": validation_errors}
            )

        # Commit final si todo fue bien
        db.commit()

    except Exception as e:
        db.rollback() # Revertir cambios
        # Loggear el error detallado en el servidor sería ideal
        print(f"Error DB: {e}") 
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar los jugadores en la base de datos: {e}"
        )

    # 7. Devolver resumen del proceso
    return {
        "mensaje": "Importación de jugadores completada.",
        "jugadores_creados": created_count,
        "jugadores_actualizados": updated_count,
        "detalles_proceso": process_details
    }

# ========= FIN NUEVO ENDPOINT: IMPORTAR JUGADORES =========

# ---- Endpoint para Importar Resultados desde Excel ----
@router.post("/resultados", status_code=status.HTTP_200_OK)
async def import_resultados_from_excel(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Importa resultados de campeonatos desde un archivo Excel (.xlsx, .xls).
    Valida los datos, busca entidades relacionadas (jugadores, clubs, tipos de campeonato),
    y crea nuevos resultados. Evita duplicados basados en una combinación de campos.
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
        # Asegurarse de que las columnas con IDs/códigos se lean como texto
        dtype_dict = {
            'IDFED Jugador': str,
            'Club Jugador (Código)': str,
            'IDFED Pareja': str,
            'Club Pareja (Código)': str,
            'Tipo Campeonato ID': int # Asumiendo que el ID del tipo de campeonato es una columna
        }
        # Intentar leer especificando dtypes, manejar posible ausencia de columnas opcionales
        try:
            df = pd.read_excel(BytesIO(content), dtype=dtype_dict)
        except ValueError as ve:
             # Si falla por dtype, leer sin dtype específico y convertir luego
             print(f"Advertencia al leer Excel con dtypes: {ve}. Intentando sin especificar dtypes.")
             df = pd.read_excel(BytesIO(content))

    except Exception as e:
        await file.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al leer el archivo Excel: {e}"
        )
    finally:
        await file.close()

    # 3. Normalización y Validación de Columnas
    original_columns = df.columns.tolist()
    df.columns = [normalize_string(col) for col in original_columns]
    normalized_df_columns = df.columns.tolist()

    # Columnas esperadas (¡Asegúrate de que coincidan con tu plantilla!)
    # Se añade 'Tipo Campeonato ID' como columna esperada.
    expected_columns_original = [
        'Tipo Campeonato ID', 'Nombre Campeonato', 'Fecha Campeonato',
        'IDFED Jugador', 'Nombre Jugador', 'Apellido Jugador', 'Club Jugador (Código)', 'Nombre Club Jugador',
        'IDFED Pareja', 'Nombre Pareja', 'Apellido Pareja', 'Club Pareja (Código)', 'Nombre Club Pareja',
        'Partida', 'Mesa', 'Grupo (A/B)', 'PG', 'DIF', 'PV', 'PT', 'MG', 'Posición' # Cambiado 'Pos' a 'Posición' para claridad
    ]
    expected_columns_normalized = [normalize_string(col) for col in expected_columns_original]

    missing_normalized_cols = [
        expected for expected in expected_columns_normalized
        if expected not in normalized_df_columns and expected not in [
            # Columnas opcionales (relacionadas con pareja) que pueden faltar
            normalize_string('IDFED Pareja'), normalize_string('Nombre Pareja'),
            normalize_string('Apellido Pareja'), normalize_string('Club Pareja (Código)'),
            normalize_string('Nombre Club Pareja')
        ]
    ]

    if missing_normalized_cols:
        original_missing_map = {normalize_string(orig): orig for orig in expected_columns_original}
        missing_original_names = [original_missing_map.get(norm_miss, norm_miss) for norm_miss in missing_normalized_cols]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Columnas obligatorias faltantes en el archivo Excel de resultados: {', '.join(missing_original_names)}"
        )

    # 4. Validación de datos fila por fila y preparación
    validation_errors: List[Dict[str, Any]] = []
    results_to_create: List[Dict[str, Any]] = []
    omitted_duplicates = [] # Para llevar registro de los omitidos

    # Convertir columnas clave a string ANTES del bucle si no se hizo con dtype
    str_cols_to_convert = ['idfed jugador', 'club jugador (codigo)', 'idfed pareja', 'club pareja (codigo)']
    for col in str_cols_to_convert:
        if col in df.columns and df[col].dtype != 'object': # object suele ser string en pandas
            df[col] = df[col].astype(str)

    # Convertir fecha (si no es ya datetime)
    date_col = normalize_string('Fecha Campeonato')
    if date_col in df.columns and not pd.api.types.is_datetime64_any_dtype(df[date_col]):
         try:
             df[date_col] = pd.to_datetime(df[date_col]).dt.date
         except Exception as e:
             raise HTTPException(
                 status_code=status.HTTP_400_BAD_REQUEST,
                 detail=f"Error al convertir la columna '{date_col}' a fecha: {e}"
             )

    # Convertir Grupo (A/B) a booleano (True=A, False=B)
    group_col = normalize_string('Grupo (A/B)')
    if group_col in df.columns:
        df[group_col] = df[group_col].apply(lambda x: True if isinstance(x, str) and x.strip().upper() == 'A' else (False if isinstance(x, str) and x.strip().upper() == 'B' else None))

    for index, row in df.iterrows():
        errors_in_row = []
        row_number = index + 2 # +1 por índice base 0, +1 por cabecera
        result_data = {} # Diccionario para almacenar datos validados de la fila

        # -- Extraer y Validar Campos Obligatorios --
        try:
            result_data['tipo_campeonato_id'] = int(row[normalize_string('Tipo Campeonato ID')])
            result_data['nombre_campeonato'] = str(row[normalize_string('Nombre Campeonato')]).strip()
            result_data['fecha_campeonato'] = row[normalize_string('Fecha Campeonato')] # Ya debería ser date
            if pd.isna(result_data['fecha_campeonato']): raise ValueError("Fecha Campeonato es obligatoria.")

            result_data['idfed_jugador'] = str(row[normalize_string('IDFED Jugador')]).strip()
            result_data['nombre_jugador'] = str(row[normalize_string('Nombre Jugador')]).strip()
            result_data['apellido_jugador'] = str(row[normalize_string('Apellido Jugador')]).strip()
            result_data['codigo_club_jugador'] = str(row[normalize_string('Club Jugador (Código)')]).strip()
            result_data['nombre_club_jugador'] = str(row[normalize_string('Nombre Club Jugador')]).strip() # Lo guardamos aunque no vaya directo al modelo Resultado

            result_data['partida'] = int(row[normalize_string('Partida')])
            result_data['mesa'] = int(row[normalize_string('Mesa')])
            result_data['gb'] = row[normalize_string('Grupo (A/B)')] # Ya debería ser bool o None
            if result_data['gb'] is None: raise ValueError("Grupo (A/B) debe ser 'A' o 'B'.")

            result_data['pg'] = int(row[normalize_string('PG')])
            result_data['dif'] = int(row[normalize_string('DIF')])
            result_data['pv'] = int(row[normalize_string('PV')])
            result_data['pt'] = int(row[normalize_string('PT')])
            result_data['mg'] = int(row[normalize_string('MG')])
            result_data['pos'] = int(row[normalize_string('Posición')]) # Usamos 'Posición' del Excel

            # Validar campos obligatorios no vacíos
            if not result_data['nombre_campeonato']: errors_in_row.append("Nombre Campeonato no puede estar vacío.")
            if not result_data['idfed_jugador']: errors_in_row.append("IDFED Jugador no puede estar vacío.")
            if not result_data['nombre_jugador']: errors_in_row.append("Nombre Jugador no puede estar vacío.")
            if not result_data['apellido_jugador']: errors_in_row.append("Apellido Jugador no puede estar vacío.")
            if not result_data['codigo_club_jugador']: errors_in_row.append("Club Jugador (Código) no puede estar vacío.")
            # (Otros campos numéricos ya validados por int())

            # Validar formatos IDFED y Código Club
            if len(result_data['idfed_jugador']) != 7 or not result_data['idfed_jugador'].isdigit():
                 errors_in_row.append(f"IDFED Jugador inválido ('{result_data['idfed_jugador']}') - debe ser 7 dígitos.")
            if len(result_data['codigo_club_jugador']) != 6 or not result_data['codigo_club_jugador'].isdigit():
                 errors_in_row.append(f"Club Jugador (Código) inválido ('{result_data['codigo_club_jugador']}') - debe ser 6 dígitos.")

        except (KeyError, ValueError, TypeError) as e:
            errors_in_row.append(f"Error en formato o campo obligatorio faltante: {e}")

        # -- Extraer y Validar Campos Opcionales (Pareja) --
        result_data['idfed_pareja'] = None
        result_data['nombre_pareja'] = None
        result_data['apellido_pareja'] = None
        result_data['codigo_club_pareja'] = None
        result_data['nombre_club_pareja'] = None # Lo guardamos aunque no vaya directo al modelo Resultado

        idfed_pareja_col = normalize_string('IDFED Pareja')
        codigo_club_pareja_col = normalize_string('Club Pareja (Código)')

        # Solo procesar pareja si el IDFED Pareja está presente y no es NaN/vacío
        if idfed_pareja_col in row and pd.notna(row[idfed_pareja_col]) and str(row[idfed_pareja_col]).strip():
            try:
                result_data['idfed_pareja'] = str(row[idfed_pareja_col]).strip()
                result_data['nombre_pareja'] = str(row[normalize_string('Nombre Pareja')]).strip()
                result_data['apellido_pareja'] = str(row[normalize_string('Apellido Pareja')]).strip()
                result_data['codigo_club_pareja'] = str(row[codigo_club_pareja_col]).strip()
                result_data['nombre_club_pareja'] = str(row[normalize_string('Nombre Club Pareja')]).strip()

                # Validar campos obligatorios de pareja si IDFED está presente
                if not result_data['nombre_pareja']: errors_in_row.append("Nombre Pareja no puede estar vacío si IDFED Pareja está presente.")
                if not result_data['apellido_pareja']: errors_in_row.append("Apellido Pareja no puede estar vacío si IDFED Pareja está presente.")
                if not result_data['codigo_club_pareja']: errors_in_row.append("Club Pareja (Código) no puede estar vacío si IDFED Pareja está presente.")

                # Validar formatos IDFED y Código Club de la pareja
                if len(result_data['idfed_pareja']) != 7 or not result_data['idfed_pareja'].isdigit():
                    errors_in_row.append(f"IDFED Pareja inválido ('{result_data['idfed_pareja']}') - debe ser 7 dígitos.")
                if len(result_data['codigo_club_pareja']) != 6 or not result_data['codigo_club_pareja'].isdigit():
                    errors_in_row.append(f"Club Pareja (Código) inválido ('{result_data['codigo_club_pareja']}') - debe ser 6 dígitos.")

            except (KeyError, ValueError, TypeError) as e:
                 errors_in_row.append(f"Error en formato o campo de pareja faltante: {e}")

        # -- Validaciones contra Base de Datos (si no hay errores de formato previos) --
        if not errors_in_row:
            # Validar existencia de Tipo Campeonato
            tipo_campeonato = db.query(TipoCampeonato).filter(TipoCampeonato.id == result_data['tipo_campeonato_id']).first()
            if not tipo_campeonato:
                 errors_in_row.append(f"Tipo de Campeonato con ID '{result_data['tipo_campeonato_id']}' no encontrado.")
            else:
                # Podríamos añadir el nombre del tipo al dict si lo necesitáramos después
                # result_data['nombre_tipo_campeonato'] = tipo_campeonato.nombre
                pass

            # Validar existencia de Jugador Principal
            jugador = db.query(Jugador).filter(Jugador.idfed == result_data['idfed_jugador']).first()
            if not jugador:
                errors_in_row.append(f"Jugador principal con IDFED '{result_data['idfed_jugador']}' no encontrado.")
            # Opcional: Validar que el nombre/apellido/club coincidan con la BD? Podría ser muy estricto.

            # Validar existencia del Club del Jugador Principal
            club_jugador = db.query(Club).filter(Club.codigo_club == result_data['codigo_club_jugador']).first()
            if not club_jugador:
                 errors_in_row.append(f"Club del jugador principal con Código '{result_data['codigo_club_jugador']}' no encontrado.")

            # Validar existencia de Pareja (si aplica)
            if result_data['idfed_pareja']:
                pareja = db.query(Jugador).filter(Jugador.idfed == result_data['idfed_pareja']).first()
                if not pareja:
                    errors_in_row.append(f"Pareja con IDFED '{result_data['idfed_pareja']}' no encontrada.")

                # Validar existencia del Club de la Pareja (si aplica)
                if result_data['codigo_club_pareja']:
                    club_pareja = db.query(Club).filter(Club.codigo_club == result_data['codigo_club_pareja']).first()
                    if not club_pareja:
                        errors_in_row.append(f"Club de la pareja con Código '{result_data['codigo_club_pareja']}' no encontrado.")

        # -- Agregar a lista de errores o a lista para procesar --
        if errors_in_row:
            validation_errors.append({"fila": row_number, "errores": errors_in_row})
        else:
            # Comprobación de duplicados ANTES de añadir a results_to_create
            # Usamos (fecha, idfed_jugador, partida, mesa) como clave única para la importación
            existing_result = db.query(Resultado).filter(
                Resultado.fecha_campeonato == result_data['fecha_campeonato'],
                Resultado.idfed_jugador == result_data['idfed_jugador'],
                Resultado.partida == result_data['partida'],
                Resultado.mesa == result_data['mesa']
                # Podríamos añadir más campos si es necesario para definir unicidad
            ).first()

            if existing_result:
                omitted_duplicates.append({
                    "fila": row_number,
                    "idfed_jugador": result_data['idfed_jugador'],
                    "fecha": str(result_data['fecha_campeonato']), # Convertir a string para JSON
                    "partida": result_data['partida'],
                    "mesa": result_data['mesa']
                })
            else:
                 # Preparamos los datos finales para ResultadoCreate
                 # Nota: Quitamos los nombres/apellidos/nombre_club que no están en ResultadoCreate
                 final_data_for_create = {k: v for k, v in result_data.items() if k in ResultadoCreate.__fields__}
                 results_to_create.append(final_data_for_create)

    # 5. Si hay errores de validación, devolverlos
    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"mensaje": "Se encontraron errores de validación en el archivo.", "errores_detalle": validation_errors}
        )

    # 6. Procesamiento en Base de Datos (Creación)
    created_count = 0
    created_details = [] # Para saber qué se creó (quizás idfed + fecha)

    if not results_to_create:
         return {
             "mensaje": "No se encontraron nuevos resultados válidos para importar.",
             "resultados_creados": 0,
             "resultados_omitidos_duplicados": len(omitted_duplicates),
             "detalles_omitidos": omitted_duplicates
         }

    try:
        for res_data in results_to_create:
            # Crear instancia del schema Pydantic para validación final (aunque ya validamos bastante)
            resultado_schema = ResultadoCreate(**res_data)

            # Crear instancia del modelo SQLAlchemy
            nuevo_resultado = Resultado(**resultado_schema.dict())

            db.add(nuevo_resultado)
            created_count += 1
            # Guardar detalle simple para el resumen
            created_details.append(f"Jugador {res_data['idfed_jugador']} - Fecha {res_data['fecha_campeonato']}")

        db.commit() # Hacer commit de todos los nuevos resultados juntos

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar los resultados en la base de datos: {e}"
        )

    # 7. Devolver resumen del proceso
    return {
        "mensaje": "Importación de resultados completada.",
        "resultados_creados": created_count,
        "resultados_omitidos_duplicados": len(omitted_duplicates),
        "detalles_omitidos": omitted_duplicates
    }
# ---- Fin Endpoint Importar Resultados ----

# No olvides incluir este router en tu app principal (main.py probablemente)
# Ejemplo: app.include_router(import_export.router, prefix="/api/import", tags=["Import/Export"]) 