# Documentación de la API - Monitoreo-iot
## 🌐 Base URL
- **Desarrollo:** `http://127.0.0.1:8000`
- **Producción:** `https://monitoreo-iot-production.up.railway.app`
## 🔐 Autenticación
### 1. Obtener Token (Login)
**POST** `/login/`
**Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
**Respuesta exitosa:**
```json
{
  "refresh": "string",
  "access": "string",
  "user": {
    "username": "string",
    "email": "string",
    "nombre": "string"
  },
  "roles": [{"nombre": "string"}],
  "recursos": [
    {"id": 1, "nombre": "Dashboard", "path": "/dashboard", "icono": "layout-dashboard", "orden": 1}
  ]
}
```
### 2. Refrescar Token
**POST** `/token/refresh/`
**Body:**
```json
{
  "refresh": "string"
}
```
**Respuesta:**
```json
{
  "access": "string"
}
```
---
## 📋 Endpoints de la API (CRUD Automático con ViewSets)
Todos los endpoints siguen el patrón RESTful estándar de Django REST Framework.
### Módulo de Autenticación y Permisos
#### Usuarios
- **GET** `/usuarios/` - Listar usuarios
- **POST** `/usuarios/` - Crear usuario
- **GET** `/usuarios/{id}/` - Detalle de usuario
- **PUT/PATCH** `/usuarios/{id}/` - Actualizar usuario
- **DELETE** `/usuarios/{id}/` - Eliminar usuario
#### Roles
- **GET** `/roles/` - Listar roles
- **POST** `/roles/` - Crear rol
- **GET** `/roles/{id}/` - Detalle de rol
- **PUT/PATCH** `/roles/{id}/` - Actualizar rol
- **DELETE** `/roles/{id}/` - Eliminar rol
#### Recursos (Menú)
- **GET** `/recursos/` - Listar recursos del menú
- **POST** `/recursos/` - Crear recurso
- **GET** `/recursos/{id}/` - Detalle de recurso
- **PUT/PATCH** `/recursos/{id}/` - Actualizar recurso
- **DELETE** `/recursos/{id}/` - Eliminar recurso
#### UsuarioHasRol (Asignar roles a usuarios)
- **GET** `/usuario-roles/` - Listar asignaciones
- **POST** `/usuario-roles/` - Asignar rol a usuario
- **GET** `/usuario-roles/{id}/` - Detalle
- **PUT/PATCH** `/usuario-roles/{id}/` - Actualizar
- **DELETE** `/usuario-roles/{id}/` - Eliminar asignación
#### RecursoHasRol (Permisos de roles sobre recursos)
- **GET** `/recurso-roles/` - Listar permisos
- **POST** `/recurso-roles/` - Asignar permiso
- **GET** `/recurso-roles/{id}/` - Detalle
- **PUT/PATCH** `/recurso-roles/{id}/` - Actualizar
- **DELETE** `/recurso-roles/{id}/` - Eliminar permiso
---
### Módulo IoT (Monitoreo)
#### Zonas de Monitoreo
- **GET** `/zonas/` - Listar zonas
- **POST** `/zonas/` - Crear zona
- **GET** `/zonas/{id}/` - Detalle de zona
- **PUT/PATCH** `/zonas/{id}/` - Actualizar zona
- **DELETE** `/zonas/{id}/` - Eliminar zona
#### Dispositivos IoT
- **GET** `/dispositivos/` - Listar dispositivos
- **POST** `/dispositivos/` - Registrar dispositivo
- **GET** `/dispositivos/{id}/` - Detalle de dispositivo
- **PUT/PATCH** `/dispositivos/{id}/` - Actualizar dispositivo
- **DELETE** `/dispositivos/{id}/` - Eliminar dispositivo
#### Tipos de Variables
- **GET** `/tipos-variables/` - Listar tipos de variables
- **POST** `/tipos-variables/` - Crear tipo de variable
- **GET** `/tipos-variables/{id}/` - Detalle
- **PUT/PATCH** `/tipos-variables/{id}/` - Actualizar
- **DELETE** `/tipos-variables/{id}/` - Eliminar
#### Sensores
- **GET** `/sensores/` - Listar sensores
- **POST** `/sensores/` - Registrar sensor
- **GET** `/sensores/{id}/` - Detalle de sensor
- **PUT/PATCH** `/sensores/{id}/` - Actualizar sensor
- **DELETE** `/sensores/{id}/` - Eliminar sensor
#### Lecturas de Sensores
- **GET** `/lecturas/` - Listar lecturas (ordenado por fecha descendente)
- **POST** `/lecturas/` - Registrar nueva lectura
- **GET** `/lecturas/{id}/` - Detalle de lectura
- **PUT/PATCH** `/lecturas/{id}/` - Actualizar lectura
- **DELETE** `/lecturas/{id}/` - Eliminar lectura
---
### Módulo de Alertas
#### Estados Ambientales
- **GET** `/estados-ambientales/` - Listar estados
- **POST** `/estados-ambientales/` - Crear estado
- **GET** `/estados-ambientales/{id}/` - Detalle
- **PUT/PATCH** `/estados-ambientales/{id}/` - Actualizar
- **DELETE** `/estados-ambientales/{id}/` - Eliminar
#### Umbrales de Alerta
- **GET** `/umbrales/` - Listar umbrales
- **POST** `/umbrales/` - Crear umbral
- **GET** `/umbrales/{id}/` - Detalle
- **PUT/PATCH** `/umbrales/{id}/` - Actualizar
- **DELETE** `/umbrales/{id}/` - Eliminar
#### Alertas
- **GET** `/alertas/` - Listar alertas (ordenado por fecha descendente)
- **POST** `/alertas/` - Crear alerta manual
- **GET** `/alertas/{id}/` - Detalle de alerta
- **PUT/PATCH** `/alertas/{id}/` - Actualizar alerta
- **DELETE** `/alertas/{id}/` - Eliminar alerta
---
### Módulo de Actuadores y Comandos
#### Buzzers
- **GET** `/buzzers/` - Listar buzzers
- **POST** `/buzzers/` - Registrar buzzer
- **GET** `/buzzers/{id}/` - Detalle
- **PUT/PATCH** `/buzzers/{id}/` - Actualizar
- **DELETE** `/buzzers/{id}/` - Eliminar
#### Estados de Buzzer
- **GET** `/estados-buzzer/` - Listar historial de estados
- **POST** `/estados-buzzer/` - Registrar nuevo estado
- **GET** `/estados-buzzer/{id}/` - Detalle
- **PUT/PATCH** `/estados-buzzer/{id}/` - Actualizar
- **DELETE** `/estados-buzzer/{id}/` - Eliminar
#### Comandos Remotos
- **GET** `/comandos/` - Listar comandos
- **POST** `/comandos/` - Enviar comando
- **GET** `/comandos/{id}/` - Detalle de comando
- **PUT/PATCH** `/comandos/{id}/` - Actualizar comando
- **DELETE** `/comandos/{id}/` - Eliminar comando
#### Respuestas de Comandos
- **GET** `/respuestas-comandos/` - Listar respuestas
- **POST** `/respuestas-comandos/` - Registrar respuesta
- **GET** `/respuestas-comandos/{id}/` - Detalle
- **PUT/PATCH** `/respuestas-comandos/{id}/` - Actualizar
- **DELETE** `/respuestas-comandos/{id}/` - Eliminar
---
### Auditoría
#### Auditoría del Sistema
- **GET** `/auditoria/` - Listar registros de auditoría (ordenado por fecha descendente)
- **POST** `/auditoria/` - Crear registro de auditoría
- **GET** `/auditoria/{id}/` - Detalle
- **PUT/PATCH** `/auditoria/{id}/` - Actualizar
- **DELETE** `/auditoria/{id}/` - Eliminar
---
## 📤 Formatos de Respuesta
La mayoría de los endpoints devuelven JSON con la estructura del modelo correspondiente. Ejemplo para DispositivoIot:
```json
{
  "id_dispositivo": 1,
  "id_zona": 1,
  "nombre": "ESP32-Jardín",
  "mac_address": "AA:BB:CC:DD:EE:FF",
  "modelo": "ESP32 DevKit",
  "firmware_version": "1.0.2",
  "ip_actual": "192.168.1.50",
  "estado": "ACTIVO",
  "ultima_conexion": "2025-01-15T10:30:00Z",
  "fecha_registro": "2025-01-10T08:00:00Z"
}
```
## 🔍 Filtros y Búsqueda
Actualmente no se han configurado filtros específicos en los ViewSets, pero DRF permite agregar filter_backends para búsqueda y ordenamiento.
## ⚠️ Notas Importantes
1. Todas las peticiones (excepto login y refresh) requieren el header:
   `Authorization: Bearer <access_token>`
2. Los endpoints que devuelven listas están paginados por defecto (configuración de DRF).
3. Los nombres de campos en las respuestas JSON corresponden a los nombres de los atributos en los modelos.
4. Para relacionar objetos (ej. crear un sensor), se envía el ID del objeto relacionado (ej. id_dispositivo: 1).
