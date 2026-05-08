from rest_framework import permissions
from .models import UsuarioHasRol

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permite acceso de lectura (GET) a cualquier usuario autenticado,
    pero solo permite escritura (POST, PUT, DELETE) si el usuario tiene el rol 'Administrador'.
    """
    def has_permission(self, request, view):
        # Si no está autenticado, no entra
        if not request.user or not request.user.is_authenticated:
            return False

        # Si es un método seguro (GET, HEAD, OPTIONS), dejamos pasar
        if request.method in permissions.SAFE_METHODS:
            return True

        # Si es superuser, dejamos pasar
        if request.user.is_superuser:
            return True

        # Verificar si tiene el rol 'Administrador'
        is_admin = UsuarioHasRol.objects.filter(
            usuario_idusuarios=request.user,
            rol_idrol__nombre='Administrador'
        ).exists()

        return is_admin
