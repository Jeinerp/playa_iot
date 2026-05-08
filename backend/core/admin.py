from django.contrib import admin
from .models import (
    Usuario, Rol, Recurso, UsuarioHasRol, RecursoHasRol,
    ZonaMonitoreo, DispositivoIot, TipoVariable, Sensor,
    LecturaSensor, EstadoAmbiental, UmbralAlerta, Alerta,
    Buzzer, EstadoBuzzer, ComandoRemoto, RespuestaComando, AuditoriaSistema
)

@admin.register(ZonaMonitoreo)
class ZonaMonitoreoAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'latitud', 'longitud', 'fecha_creacion')
    search_fields = ('nombre',)

@admin.register(DispositivoIot)
class DispositivoIotAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'id_zona', 'mac_address', 'ip_actual', 'estado', 'ultima_conexion')
    list_filter = ('estado', 'id_zona')
    search_fields = ('nombre', 'mac_address')

@admin.register(Sensor)
class SensorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'id_dispositivo', 'id_tipo_variable', 'estado')
    list_filter = ('estado', 'id_tipo_variable', 'id_dispositivo')
    search_fields = ('nombre',)

@admin.register(LecturaSensor)
class LecturaSensorAdmin(admin.ModelAdmin):
    list_display = ('id_sensor', 'id_tipo_variable', 'valor', 'fecha_hora')
    list_filter = ('id_tipo_variable', 'fecha_hora')
    date_hierarchy = 'fecha_hora'

@admin.register(Alerta)
class AlertaAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'id_dispositivo', 'estado', 'fecha_generacion')
    list_filter = ('estado', 'fecha_generacion')
    search_fields = ('titulo', 'mensaje')

@admin.register(Buzzer)
class BuzzerAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'id_dispositivo', 'estado')
    list_filter = ('estado',)

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'nombre', 'apellido')
    search_fields = ('username', 'nombre')

@admin.register(Rol)
class RolAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'estado')

# Registro simple para las tablas relacionales y secundarias
@admin.register(
    Recurso, UsuarioHasRol, RecursoHasRol, TipoVariable, 
    EstadoAmbiental, UmbralAlerta, EstadoBuzzer, 
    ComandoRemoto, RespuestaComando, AuditoriaSistema
)
class SimpleAdmin(admin.ModelAdmin):
    pass