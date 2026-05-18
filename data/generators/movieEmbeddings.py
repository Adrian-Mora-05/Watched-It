from sentence_transformers import SentenceTransformer
from db import supabase

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

def generate_embedding(text):
    return model.encode(text).tolist()

def popularityToText(popularity):
    if popularity < 200_000:
        return "obscure underground indie hidden gem movie"
    elif popularity < 800_000:
        return "moderately known film with a dedicated audience"
    elif popularity < 1_500_000:
        return "popular well known movie"
    else:
        return "very popular mainstream blockbuster movie"
    
def loadEmbeddings():
    # 1. fetch all movies
    movies = supabase.table("pelicula").select("id, titulo, sinopsis, genero, popularidad,pais").execute()
    
    # 2. fetch all ratings
    ratings = supabase.table("calificacion_x_pelicula").select("id, calificacion, id_pelicula").execute()
    
    # 3. fetch all comments
    comments = supabase.table("comentario_x_pelicula").select("contenido, id_calificacion_x_pelicula").execute()

    # index ratings by id for fast lookup
    ratings_by_id = {r["id"]: r for r in ratings.data}
    
    # group comments by rating id
    comments_by_rating = {}
    for c in comments.data:
        rid = c["id_calificacion_x_pelicula"]
        comments_by_rating.setdefault(rid, []).append(c["contenido"])

    # group ratings by movie id
    ratings_by_movie = {}
    for r in ratings.data:
        ratings_by_movie.setdefault(r["id_pelicula"], []).append(r)

    for movie in movies.data:
        movie_ratings = ratings_by_movie.get(movie["id"], [])
        
        reviews_text = ""
        for rating in movie_ratings:
            for contenido in comments_by_rating.get(rating["id"], []):
                reviews_text += f" {contenido}" * rating["calificacion"]

        text = f"""
            {movie['titulo']}
            {movie['genero']}
            {movie['sinopsis']}
            {movie['pais']}
            {popularityToText(movie['popularidad'])}
            {reviews_text}
        """

        embedding = generate_embedding(text)

        supabase.table("pelicula").update({
            "vector": embedding
        }).eq("id", movie["id"]).execute()

        print(f"Embedding generated for {movie['titulo']}")