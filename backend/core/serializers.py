from rest_framework import serializers
from .models import *
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import UsuarioHasRol, RecursoHasRol
# ==========================================
# 1. SERIALIZERS DE AUTENTICACIÓN (image_6caa5a.png)
# ==========================================
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        # 1. Información básica del usuario
        data['user'] = {
            'id': user.idusuarios,
            'username': user.username,
            'nombre': f"{user.nombre} {user.apellido}",
        }

        # 2. Obtener los Roles reales desde la base de datos
        # Buscamos en la tabla intermedia que corriges en el Admin
        user_roles = UsuarioHasRol.objects.filter(usuario_idusuarios=user)
        data['roles'] = [{'id': ur.rol_idrol.idrol, 'nombre': ur.rol_idrol.nombre} for ur in user_roles]

        # 3. Obtener los Recursos (Menú) dinámicamente
        # Buscamos los recursos asociados a los roles que tiene el usuario
        roles_ids = [ur.rol_idrol.idrol for ur in user_roles]
        recursos_asignados = RecursoHasRol.objects.filter(rol_idrol__in=roles_ids).select_related('recurso_idrecursos')

        # Formateamos para Angular (eliminando duplicados si tiene varios roles)
        menu = {}
        for ra in recursos_asignados:
            rec = ra.recurso_idrecursos
            if rec.idRecursos not in menu:
                menu[rec.idRecursos] = {
                    'id': rec.idRecursos,
                    'nombre': rec.nombre,
                    'path': rec.path,
                    'icono': rec.icono,
                    'orden': rec.orden
                }

        # Ordenar el menú y enviarlo
        data['recursos'] = sorted(menu.values(), key=lambda x: x['orden'])
        
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
