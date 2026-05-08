from rest_framework import viewsets
from .models import *
from .serializers import *
from rest_framework_simplejwt.views import TokenObtainPairView
# ==========================================
# 1. VISTAS DE AUTENTICACIÓN (image_6caa5a.png)
# ==========================================
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UsuarioSerializer
    
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

class RecursoViewSet(viewsets.ModelViewSet):
    queryset = Recurso.objects.all()
    serializer_class = RecursoSerializer

class UsuarioHasRolViewSet(viewsets.ModelViewSet):
    queryset = UsuarioHasRol.objects.all()
    serializer_class = UsuarioHasRolSerializer

class RecursoHasRolViewSet(viewsets.ModelViewSet):
    queryset = RecursoHasRol.objects.all()
    serializer_class = RecursoHasRolSerializer

# ==========================================
# 2. VISTAS IOT (jeiner_playa_2.png)
# ==========================================

class ZonaMonitoreoViewSet(viewsets.ModelViewSet):
    queryset = ZonaMonitoreo.objects.all()
    serializer_class = ZonaMonitoreoSerializer

class DispositivoIotViewSet(viewsets.ModelViewSet):
    queryset = DispositivoIot.objects.all()
    serializer_class = DispositivoIotSerializer

class TipoVariableViewSet(viewsets.ModelViewSet):
    queryset = TipoVariable.objects.all()
    serializer_class = TipoVariableSerializer

class SensorViewSet(viewsets.ModelViewSet):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

class LecturaSensorViewSet(viewsets.ModelViewSet):
    queryset = LecturaSensor.objects.all().order_by('-fecha_hora')
    serializer_class = LecturaSensorSerializer

class EstadoAmbientalViewSet(viewsets.ModelViewSet):
    queryset = EstadoAmbiental.objects.all()
    serializer_class = EstadoAmbientalSerializer

class UmbralAlertaViewSet(viewsets.ModelViewSet):
    queryset = UmbralAlerta.objects.all()
    serializer_class = UmbralAlertaSerializer

class AlertaViewSet(viewsets.ModelViewSet):
    queryset = Alerta.objects.all().order_by('-fecha_generacion')
    serializer_class = AlertaSerializer

class BuzzerViewSet(viewsets.ModelViewSet):
    queryset = Buzzer.objects.all()
    serializer_class = BuzzerSerializer

class EstadoBuzzerViewSet(viewsets.ModelViewSet):
    queryset = EstadoBuzzer.objects.all().order_by('-fecha_hora')
    serializer_class = EstadoBuzzerSerializer

class ComandoRemotoViewSet(viewsets.ModelViewSet):
    queryset = ComandoRemoto.objects.all()
    serializer_class = ComandoRemotoSerializer

class RespuestaComandoViewSet(viewsets.ModelViewSet):
    queryset = RespuestaComando.objects.all()
    serializer_class = RespuestaComandoSerializer

class AuditoriaSistemaViewSet(viewsets.ModelViewSet):
    queryset = AuditoriaSistema.objects.all().order_by('-fecha_hora')
    serializer_class = AuditoriaSistemaSerializer