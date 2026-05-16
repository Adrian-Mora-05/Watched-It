from faker import Faker
from db import supabase

def generate_user_data(user_dict):
    fake = Faker()

    for _ in range(100): # generate 100 users
        nombre = fake.name()
        correo = fake.email()
        contrasena = fake.password(length=10)
        user_dict.append({'nombre': nombre, 'correo': correo, 'contraseña': contrasena})
        print(f"Generated user # {len(user_dict)}: {nombre}, {correo}, {contrasena}")

    return user_dict
    

def loadUsersIntoDB(records):
    response = supabase.table("usuario").select("id", count="exact").execute()

    if response.count >= 100:
        print("Database already has 100+ users, skipping load.")
        existing = supabase.table("usuario").select("id").execute()
        return [row["id"] for row in existing.data]

    uuids = []
    for user in records:
        try:
            auth_response = supabase.auth.admin.create_user({  # capture auth response separately
                "email": user["correo"],
                "password": user["contraseña"],
                "email_confirm": True,
                "user_metadata": {
                    "nombre": user["nombre"]
                }
            })
            user_id = auth_response.user.id  # pull id from the right response
            uuids.append(user_id)
            print(f"Created user {user['correo']} with id {user_id}")
        except Exception as e:
            print(f"Error creating user {user['correo']}: {e}")

    return uuids