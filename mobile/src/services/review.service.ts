import api from "./api";

export const baseUrl = "https://m.media-amazon.com/images/M/"; // all the img urls start with this

export const getAllReviews = async (skip: number, limit: number) => {
  const response = await api.get("/review", { 
    params: { skip, limit }
  });
  return response.data;
  /*[
    {
        "id": 1,
        "contenido": "really nice",
        "cant_me_gusta": 20,
        "calificacion": 5,
        "nombre": "ximemolina",
        "titulo": "The Shawshank Redemption",
        "año": 1994,
        "enlace_imagen": "MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_.jpg"
    },
    {
        "id": 16,
        "contenido": "de mis favoritas",
        "cant_me_gusta": 6,
        "calificacion": 5,
        "nombre": "camila",
        "titulo": "Up",
        "año": 2009,
        "enlace_imagen": "MV5BNmI1ZTc5MWMtMDYyOS00ZDc2LTkzOTAtNjQ4NWIxNjYyNDgzXkEyXkFqcGc@._V1_.jpg"
    },
    {
        "id": 9,
        "contenido": "10/10",
        "cant_me_gusta": 5,
        "calificacion": 5,
        "nombre": "ximemolina",
        "titulo": "Nuovo Cinema Paradiso",
        "año": 1988,
        "enlace_imagen": "MV5BYmI5ZDY5ZDQtYmMyZS00NjU4LTg5NzgtZWMxYjFkMzQzZThiXkEyXkFqcGc@._V1_.jpg"
    },
    {
        "id": 5,
        "contenido": "súper bueno",
        "cant_me_gusta": 2,
        "calificacion": 4,
        "nombre": "camtthom",
        "titulo": "Ojing-eo geim",
        "año": 2021,
        "enlace_imagen": "MV5BYTU3ZDVhNmMtMDVlNC00MDc0LTgwNDMtYWE5MTI2ZGI4YWIwXkEyXkFqcGc@._V1_.jpg"
    },
    {
        "id": 1,
        "contenido": "really nice",
        "cant_me_gusta": 1,
        "calificacion": 5,
        "nombre": "ximemolina",
        "titulo": "Breaking Bad",
        "año": 2008,
        "enlace_imagen": "MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_.jpg"
    }
] */
};
