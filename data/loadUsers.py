from faker import Faker
import pandas as pd
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))

def generate_user_data(user_dict):
    fake = Faker()

    for _ in range(100): # generate 100 users
        nombre = fake.name()
        correo = fake.email()
        contrasena = fake.password(length=10)
        user_dict.append({'nombre': nombre, 'correo': correo, 'contraseña': contrasena})
        print(f"Generated user # {len(user_dict)}: {nombre}, {correo}, {contrasena}")

    df = pd.DataFrame(user_dict)
    return df

def loadIntoDB(records):
    response = supabase.table("usuario").select("id", count="exact").execute()
    
    if response.count >= 100:
        print("Database already has 100+ users, skipping load.")
        return
    
    for user in records:
        try:
            supabase.auth.admin.create_user({
                "email": user["correo"],
                "password": user["contraseña"],
                "email_confirm": True,
                "user_metadata": {
                    "nombre": user["nombre"]
                }
            })
        except Exception as e:
            print(f"Error inserting user {user['correo']}: {e}")