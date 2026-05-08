from django.contrib import admin
from .models import (
  Usuario, Rol, Recurso, UsuarioHasRol, RecursoHasRol,
    ZonaMonitoreo, DispositivoIot, TipoVariable, Sensor,
    LecturaSensor, EstadoAmbiental, UmbralAlerta, Alerta,
    Buzzer, EstadoBuzzer, ComandoRemoto, RespuestaComando, AuditoriaSistema
)

# Registro automático de las 16 tablas
@admin.register(
    Usuario, Rol, Recurso, UsuarioHasRol, RecursoHasRol,
    ZonaMonitoreo, DispositivoIot, TipoVariable, Sensor,
    LecturaSensor, EstadoAmbiental, UmbralAlerta, Alerta,
    Buzzer, ComandoRemoto, AuditoriaSistema,RespuestaComando, EstadoBuzzer
)
class IotAdmin(admin.ModelAdmin):
    pass