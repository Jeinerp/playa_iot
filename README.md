# Monitoreo-iot 🌐
Sistema de monitoreo IoT para sensores ambientales con autenticación JWT y control de acceso basado en roles.
## 📋 Descripción
Este proyecto es una API REST desarrollada en Django para la gestión de dispositivos IoT, sensores, lecturas y alertas. Permite el monitoreo en tiempo real de variables ambientales y la generación automática de alertas basadas en umbrales configurables.
## 🚀 Características Principales
- ✅ Autenticación JWT con menú dinámico
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Gestión de zonas, dispositivos y sensores
- ✅ Registro de lecturas de sensores
- ✅ Sistema de alertas automáticas
- ✅ Comandos remotos a dispositivos
- ✅ Auditoría de acciones
## 🛠️ Tecnologías
- **Backend:** Django + Django REST Framework
- **Autenticación:** SimpleJWT
- **Base de Datos:** MySQL (Producción) / SQLite (Desarrollo)
- **Despliegue:** Railway.app
- **Frontend:** Angular (esperado en localhost:5173)
## 📂 Estructura del Proyecto
Monitoreo-iot/
├── config/                 # Configuración Django
│   ├── settings.py        # Ajustes principales
│   ├── urls.py            # Rutas principales
│   └── ...
├── core/                   # Aplicación principal
│   ├── models.py          # 18 modelos de datos
│   ├── views.py           # 18 ViewSets
│   ├── serializers.py     # Serializadores
│   └── urls.py            # Rutas de la API
├── AI_README.md            # 📖 Referencia rápida para IAs
├── PROJECT_CONTEXT.md      # 📖 Contexto completo
├── ARCHITECTURE.md         # 📖 Arquitectura del sistema
├── DATABASE_SCHEMA.md      # 📖 Esquema de base de datos
├── API_DOCUMENTATION.md    # 📖 Documentación de endpoints
└── requirements.txt        # Dependencias
## 📖 Documentación
Para entender el proyecto rápidamente, consulta los siguientes archivos (ordenados por relevancia para IAs):
1. **[AI_README.md](AI_README.md)** - Resumen ejecutivo para IAs (empieza aquí).
2. **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** - Contexto y descripción general.
3. **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura y flujos del sistema.
4. **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** - Esquema detallado de la base de datos.
5. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Documentación completa de la API REST.
## ⚙️ Instalación y Ejecución
### Requisitos
- Python 3.8+
- pip
- MySQL (opcional, se puede usar SQLite)
### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Jeinerp/Monitoreo-iot.git
   cd Monitoreo-iot
   ```
2. **Crear entorno virtual:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```
3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configurar base de datos:**
   - Crea un archivo .env basado en las variables en settings.py.
   - O usa SQLite cambiando DATABASES en settings.py temporalmente.
5. **Migraciones:**
   ```bash
   python manage.py migrate
   ```
6. **Crear superusuario (opcional):**
   ```bash
   python manage.py createsuperuser
   ```
7. **Ejecutar servidor:**
   ```bash
   python manage.py runserver
   ```
8. **Acceder:** http://127.0.0.1:8000/
## 🌐 API Endpoints Principales
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/login/` | Obtener tokens JWT |
| GET | `/usuarios/` | Gestión de usuarios |
| GET | `/dispositivos/` | Dispositivos IoT |
| GET | `/sensores/` | Sensores |
| GET | `/lecturas/` | Lecturas de sensores |
| GET | `/alertas/` | Alertas |
Ver **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** para la lista completa.
## ⚠️ Notas de Seguridad
Este proyecto es para entrega académica. No usar en producción sin antes:
- Configurar variables de entorno para SECRET_KEY y credenciales.
- Cambiar DEBUG = False.
- Usar hashing para contraseñas en el modelo Usuario.
## 👤 Autor
- Jeinerp
- Repositorio: [github.com/Jeinerp/Monitoreo-iot](https://github.com/Jeinerp/Monitoreo-iot)
## 📄 Licencia
Proyecto académico - Todos los derechos reservados.
