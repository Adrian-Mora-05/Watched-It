from sentence_transformers import SentenceTransformer
from db import supabase

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

def generate_embedding(text):
    return model.encode(text).tolist()

def loadEmbeddings():
    movies = supabase.table("pelicula").select("id, titulo, sinopsis, genero").execute()
    
    for movie in movies.data:
        text = f"{movie['titulo']} {movie['genero']} {movie['sinopsis']}"#add more for more accuracy
        
        embedding = generate_embedding(text)
        
        supabase.table("pelicula").update({
            "vector": embedding
        }).eq("id", movie["id"]).execute()
        
        print(f"Embedding generated for {movie['titulo']}")