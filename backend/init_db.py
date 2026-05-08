import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import call_command

def initialize():
    print("--- Iniciando Migraciones ---")
    call_command('migrate')
    
    User = get_user_model()
    if not User.objects.filter(username='admin').exists():
        print("--- Creando Superusuario (admin / admin123) ---")
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    else:
        print("--- El usuario admin ya existe ---")

    print("--- Cargando datos iniciales ---")
    try:
        import populate_data
        populate_data.populate() 
    except Exception as e:
        print(f"Error cargando datos: {e}")

    print("--- Inicialización completada con éxito ---")

if __name__ == '__main__':
    initialize()
