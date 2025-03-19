# Importaciones necesarias
import os
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from .routes import club, jugador, tipo_campeonato, resultado, campeonato
from .db.database import Base, engine
from .db.session import get_db
from .db.init_db import init_tipos_campeonatos

# Obtener la ruta del directorio actual
current_dir = os.path.dirname(os.path.abspath(__file__))
templates = Jinja2Templates(directory=os.path.join(current_dir, "templates"))

# Crear la aplicación FastAPI
app = FastAPI(
    title="Histórico Domino API",
    description="API para gestionar el histórico de partidas de dominó",
    version="1.0.0"
)

# Configurar CORS para permitir todos los orígenes
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Puerto por defecto de Vite
        "http://localhost:5174",  # Puerto alternativo de Vite
        "http://localhost:5371",  # Puerto específico del frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

# Inicializar los tipos de campeonatos
db = next(get_db())
init_tipos_campeonatos(db)

# Endpoint raíz
@app.get("/", include_in_schema=False)
async def read_root():
    return JSONResponse(
        content={
            "status": "online",
            "message": "Backend funcionando en el puerto 8000",
            "version": "1.0.0"
        }
    )

# Endpoint personalizado para la documentación Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html(request: Request):
    return templates.TemplateResponse(
        "swagger_ui.html",
        {
            "request": request,
            "openapi_url": app.openapi_url,
            "title": f"{app.title} - Swagger UI"
        }
    )

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory=os.path.dirname(current_dir)), name="static")

# Incluir routers con prefijo /api
app.include_router(club.router, prefix="/api")
app.include_router(jugador.router, prefix="/api")
app.include_router(tipo_campeonato.router, prefix="/api")
app.include_router(resultado.router, prefix="/api")
app.include_router(campeonato.router, prefix="/api") 