# AI Quick Reference - Monitoreo-iot
**Tipo:** Proyecto Académico - API REST para Monitoreo IoT  
**Lenguaje:** Python 3.x  
**Framework:** Django + Django REST Framework  
**Base de Datos:** MySQL (Producción) / SQLite (Desarrollo)  
**Autenticación:** JWT (JSON Web Tokens)  
---
## 📂 Estructura de Archivos Clave
Para que una IA analice el proyecto, estos son los archivos principales:
1. **core/models.py** - Contiene los 18 modelos de datos (Usuario, DispositivoIot, Sensor, LecturaSensor, etc.)
2. **core/views.py** - Contiene los 18 ViewSets que definen la lógica de la API
3. **core/serializers.py** - Define cómo se convierten los modelos a JSON
4. **core/urls.py** - Define las rutas de la API (endpoints)
5. **config/settings.py** - Configuración de Django, base de datos, CORS, JWT
---
## 🎯 Funcionalidad Principal
- **Autenticación:** Login con JWT que devuelve también roles y recursos del menú.
- **Gestión de Usuarios:** Control de acceso basado en roles (RBAC).
- **Monitoreo IoT:** Registro de zonas, dispositivos, sensores y lecturas.
- **Alertas:** Sistema de umbrales que genera alertas automáticas.
- **Comandos:** Envío de comandos remotos a dispositivos y recepción de respuestas.
- **Auditoría:** Registro de acciones de usuarios.
---
## 🌐 Endpoints Principales
| Método | URL | Descripción |
|--------|-----|-------------|
| POST | `/login/` | Obtener tokens JWT |
| POST | `/token/refresh/` | Refrescar token |
| GET/POST | `/usuarios/` | Gestión de usuarios |
| GET/POST | `/roles/` | Gestión de roles |
| GET/POST | `/zonas/` | Zonas de monitoreo |
| GET/POST | `/dispositivos/` | Dispositivos IoT |
| GET/POST | `/sensores/` | Sensores |
| GET/POST | `/lecturas/` | Lecturas de sensores |
| GET/POST | `/alertas/` | Alertas generadas |
*(Hay más endpoints definidos en `core/urls.py`)*
---
## 🛠️ Tecnologías Utilizadas
- **Django:** Framework web (Versión 5.x o superior)
- **Django REST Framework:** Para construir la API REST
- **SimpleJWT:** Para autenticación basada en tokens
- **MySQL:** Base de datos relacional
- **CORS Headers:** Para permitir peticiones desde Angular (localhost:5173)
- **Whitenoise:** Para servir archivos estáticos en producción
---
## ⚠️ Notas para IAs
- El código está en **español** (nombres de modelos, variables, comentarios).
- El proyecto usa `ViewSets` de DRF, lo que hace que la API sea estándar (CRUD automático).
- La base de datos ya tiene datos en producción (Railway).
- Hay código duplicado (`UsuarioViewSet` y `UsuarioSerializer` aparecen dos veces).
- Las contraseñas en el modelo `Usuario` se guardan en texto plano (campo `CharField`).
---
## 🚀 Cómo ejecutar (Desarrollo)
1. Clonar repositorio
2. Crear entorno virtual: `python -m venv venv`
3. Instalar dependencias: `pip install -r requirements.txt`
4. Configurar `.env` con base de datos local (SQLite recomendada para pruebas)
5. Ejecutar migraciones: `python manage.py migrate`
6. Iniciar servidor: `python manage.py runserver`
---
**Última actualización:** 2025  
**Autor:** Jeinerp  
**Para:** Entrega académica
