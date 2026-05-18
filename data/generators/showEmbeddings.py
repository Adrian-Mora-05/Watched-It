from sentence_transformers import SentenceTransformer
from db import supabase

model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")

def generate_embedding(text):
    return model.encode(text).tolist()

def popularityToText(popularity):
    if popularity < 200_000:
        return "serie underground indie joya oculta"
    elif popularity < 800_000:
        return "serie moderadamente conocida con un público fiel."
    elif popularity < 1_500_000:
        return "serie popular y conocida"
    else:
        return "serie taquillera de gran éxito comercial muy popular"
    
def loadEmbeddings():
    # 1. fetch all shows
    shows = supabase.table("serie").select("id, titulo, sinopsis, genero, popularidad,pais").execute()
    
    # 2. fetch all ratings
    ratings = supabase.table("calificacion_x_serie").select("id, calificacion, id_serie").execute()
    
    # 3. fetch all comments
    comments = supabase.table("comentario_x_serie").select("contenido, id_calificacion_x_serie").execute()

    # index ratings by id for fast lookup
    ratings_by_id = {r["id"]: r for r in ratings.data}
    
    # group comments by rating id
    comments_by_rating = {}
    for c in comments.data:
        rid = c["id_calificacion_x_serie"]
        comments_by_rating.setdefault(rid, []).append(c["contenido"])

    # group ratings by show id
    ratings_by_show = {}
    for r in ratings.data:
        ratings_by_show.setdefault(r["id_serie"], []).append(r)

    for show in shows.data:
        show_ratings = ratings_by_show.get(show["id"], [])
        
        reviews_text = ""
        for rating in show_ratings:
            for contenido in comments_by_rating.get(rating["id"], []):
                reviews_text += f" {contenido}" * rating["calificacion"]

        text = f"""
            {show['titulo']}
            {show['genero']}
            {show['sinopsis']}
            {show['pais']}
            {popularityToText(show['popularidad'])}
            {reviews_text}
        """

        embedding = generate_embedding(text)

        supabase.table("serie").update({
            "vector": embedding
        }).eq("id", show["id"]).execute()

        print(f"Embedding generated for {show['titulo']}")