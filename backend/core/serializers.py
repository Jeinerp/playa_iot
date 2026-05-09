from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db import transaction
# ==========================================
# 1. SERIALIZERS DE AUTENTICACIÓN (image_6caa5a.png)
# ==========================================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Aquí agregamos los datos que Angular necesita
        data['user'] = {
            'username': self.user.username,
            'email': self.user.email,
            'nombre': self.user.first_name or self.user.username,
        }
        # Enviamos roles y recursos (aunque sea un superuser, enviamos arrays vacíos o sus permisos)
        data['roles'] = [{'nombre': 'Superadministrador'}] if self.user.is_superuser else []
        data['recursos'] = [
            {'id': 1, 'nombre': 'Dashboard', 'path': '/dashboard', 'icono': 'layout-dashboard', 'orden': 1},
            {'id': 2, 'nombre': 'Dispositivos', 'path': '/dispositivos', 'icono': 'cpu', 'orden': 2},
            {'id': 3, 'nombre': 'Zonas', 'path': '/zonas', 'icono': 'map', 'orden': 3},
            {'id': 4, 'nombre': 'Sensores', 'path': '/sensores', 'icono': 'thermometer', 'orden': 4},
            {'id': 5, 'nombre': 'Lecturas', 'path': '/lecturas', 'icono': 'database', 'orden': 5},
            {'id': 6, 'nombre': 'Alertas', 'path': '/alertas', 'icono': 'alert-triangle', 'orden': 6},
            {'id': 7, 'nombre': 'Roles', 'path': '/roles', 'icono': 'shield', 'orden': 7}
        ] # Menú oficial
        return data
class UsuarioSerializer(serializers.ModelSerializer):
    # Campo virtual para recibir el rol desde el formulario
    id_rol = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Usuario
        fields = ['idusuarios', 'nombre', 'apellido', 'username', 'password', 'id_rol']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Extraemos el ID del rol
        id_rol = validated_data.pop('id_rol', None)
        
        with transaction.atomic():
            # 1. Crear el usuario
            usuario = Usuario.objects.create(**validated_data)
            
            # 2. Si el administrador seleccionó una función, asignarla
            if id_rol:
                rol = Rol.objects.get(pk=id_rol)
                UsuarioHasRol.objects.create(
                    usuario_idusuarios=usuario,
                    rol_idrol=rol
                )
        return usuario

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = '__all__'

class RecursoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recurso
        fields = '__all__'

from django.contrib.auth import get_user_model

class UsuarioHasRolSerializer(serializers.ModelSerializer):
    # 'usuario' recibirá el ID y lo guardará en 'usuario_idusuarios'
    usuario = serializers.PrimaryKeyRelatedField(
        source='usuario_idusuarios', 
        queryset=get_user_model().objects.all()
    )
    # 'rol' recibirá el ID y lo guardará en 'rol_idrol'
    rol = serializers.PrimaryKeyRelatedField(
        source='rol_idrol', 
        queryset=Rol.objects.all()
    )

    class Meta:
        model = UsuarioHasRol
        fields = ['id', 'usuario', 'rol'] # Solo usamos estos nombres limpios

class RecursoHasRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecursoHasRol
        fields = '__all__'

# ==========================================
# 2. SERIALIZERS IOT (jeiner_playa_2.png)
# ==========================================

class ZonaMonitoreoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZonaMonitoreo
        fields = '__all__'

class DispositivoIotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DispositivoIot
        fields = '__all__'

class TipoVariableSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoVariable
        fields = '__all__'

class SensorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sensor
        fields = '__all__'

class LecturaSensorSerializer(serializers.ModelSerializer):
    # Campos de solo lectura para facilitar la visualización en el Frontend
    sensor_nombre = serializers.ReadOnlyField(source='id_sensor.nombre')
    variable_nombre = serializers.ReadOnlyField(source='id_tipo_variable.nombre')
    unidad = serializers.ReadOnlyField(source='id_tipo_variable.unidad_medida')

    class Meta:
        model = LecturaSensor
        fields = '__all__'

class EstadoAmbientalSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoAmbiental
        fields = '__all__'

class UmbralAlertaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UmbralAlerta
        fields = '__all__'

class AlertaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerta
        fields = '__all__'

class BuzzerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Buzzer
        fields = '__all__'

class EstadoBuzzerSerializer(serializers.ModelSerializer):
    class Meta:
        model = EstadoBuzzer
        fields = '__all__'

class ComandoRemotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComandoRemoto
        fields = '__all__'

class RespuestaComandoSerializer(serializers.ModelSerializer):
    class Meta:
        model = RespuestaComando
        fields = '__all__'

class AuditoriaSistemaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditoriaSistema
        fields = '__all__'
