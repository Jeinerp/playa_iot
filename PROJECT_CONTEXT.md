# Contexto del Proyecto para IA - Monitoreo-iot
## 📌 Descripción General
**Monitoreo-iot** es un sistema backend desarrollado en Django para la gestión y monitoreo de dispositivos IoT (Internet de las Cosas). El sistema permite registrar zonas geográficas, dispositivos, sensores y visualizar lecturas en tiempo real, así como generar alertas basadas en umbrales configurables.
## 🎯 Objetivos del Sistema
1. **Gestión de Usuarios:** Registro de usuarios con roles y permisos específicos (RBAC).
2. **Monitoreo Ambiental:** Recolección de datos de sensores (temperatura, humedad, etc.).
3. **Alertas Automáticas:** Generación de alertas cuando las lecturas superan umbrales peligrosos.
4. **Control Remoto:** Envío de comandos a dispositivos IoT (ej. reiniciar, cambiar configuración).
5. **Auditoría:** Registro de todas las acciones importantes del sistema.
## 🏗️ Arquitectura
Cliente Angular (Frontend) <---HTTP/JSON---> Django REST API (Backend) <---> Base de Datos MySQL
                                      |
                                      v
                             Autenticación JWT
                                      |
                                      v
                             Control de Acceso (Roles)
### Componentes Principales:
- **API REST:** Construida con Django REST Framework usando ViewSets.
- **Autenticación:** JWT con django-simplejwt. El login devuelve también el menú de navegación.
- **Base de Datos:** Relacional MySQL con 18 tablas.
- **Despliegue:** En Railway.app (https://monitoreo-iot-production.up.railway.app)
## 📦 Módulos del Sistema
### 1. Módulo de Autenticación y Permisos
- `Usuario`: Usuarios del sistema.
- `Rol`: Roles disponibles (Admin, Usuario, etc.).
- `Recurso`: Elementos del menú lateral (Dashboard, Dispositivos, etc.).
- `UsuarioHasRol`: Asignación de roles a usuarios.
- `RecursoHasRol`: Permisos de roles sobre recursos.
### 2. Módulo IoT (Monitoreo)
- `ZonaMonitoreo`: Áreas geográficas con coordenadas GPS.
- `DispositivoIot`: Dispositivos registrados (MAC, IP, firmware).
- `TipoVariable`: Tipos de mediciones (Temperatura, Humedad, etc.).
- `Sensor`: Sensores instalados en dispositivos.
- `LecturaSensor`: Valores capturados por los sensores con timestamp.
### 3. Módulo de Alertas
- `EstadoAmbiental`: Estados posibles (Normal, Alerta, Peligro).
- `UmbralAlerta`: Rangos de valores para cada variable y estado.
- `Alerta`: Registros de alertas generadas.
### 4. Módulo de Actuadores y Comandos
- `Buzzer`: Dispositivos de alarma sonora.
- `EstadoBuzzer`: Historial de estados del buzzer.
- `ComandoRemoto`: Comandos enviados a dispositivos.
- `RespuestaComando`: Respuestas de los dispositivos.
### 5. Auditoría
- `AuditoriaSistema`: Log de acciones de usuarios.
## 🔗 Relaciones Importantes
- Un `Usuario` tiene uno o varios `Rol`es.
- Un `Rol` tiene acceso a varios `Recurso`s (menú).
- Una `ZonaMonitoreo` tiene varios `DispositivoIot`.
- Un `DispositivoIot` tiene varios `Sensor`es.
- Un `Sensor` genera muchas `LecturaSensor`.
- Una `LecturaSensor` puede disparar una `Alerta` si supera un `UmbralAlerta`.
## 📊 Stack Tecnológico Detallado
| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| Lenguaje | Python | 3.x |
| Framework Web | Django | 5.x (o superior) |
| API REST | Django REST Framework | 3.17.1 |
| Autenticación | djangorestframework-simplejwt | 5.5.1 |
| Base de Datos | MySQL | 8.x |
| CORS | django-cors-headers | 4.9.0 |
| Servidor WSGI | Gunicorn | 25.3.0 |
| Variables de entorno | python-dotenv | 1.2.2 |
## 🌐 Configuración de Red
- **Frontend (Angular):** Esperado en `http://localhost:5173` durante desarrollo.
- **Backend (Django):** En producción en Railway, en desarrollo en `http://127.0.0.1:8000`.
- **CORS:** Configurado para permitir credenciales y origen del frontend.
## 🚧 Problemas Conocidos (Para IA)
1. **Contraseñas inseguras:** El modelo `Usuario` usa `CharField` para password, guardando texto plano.
2. **Código duplicado:** `UsuarioViewSet` y `UsuarioSerializer` están definidos dos veces.
3. **Datos quemados:** El serializer de login devuelve un menú estático en lugar de consultar la base de datos.
4. **Configuración sensible expuesta:** `SECRET_KEY` y credenciales de BD están en `settings.py` (no usar en producción real).
## 📝 Notas para la IA
- Este proyecto es para **entrega académica**, no para producción real.
- Todo el código, comentarios y documentación están en **español**.
- Se prefiere documentación en archivos separados y pequeños para fácil procesamiento.
- El proyecto usa convenciones de Django pero con nombres de tablas personalizados (`db_table`).
---
**Fin del contexto.**
