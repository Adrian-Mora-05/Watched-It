import api from "./api";
import { ReadMovieParam } from "@shared/movie.schema";

export const baseUrl = "https://m.media-amazon.com/images/M/"; // all the img urls start with this

export const getMovies = async (param: ReadMovieParam) => {
  const response = await api.get("/movie", { 
    params: param
  });
  return response.data;
};

export const getFavoriteMoviesByUser = async (token: string) => {
  const response = await api.get('/movie/favorites', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getMovieById = async (id: number, id_user: string, name: string) => {
  const response = await api.get(`/movie/${id}`, {
    params: { id_user, name }
  });
  return response.data;
};

export const getMovieReviews = async (id: number, id_usuario: string, skip: number, limit: number) => {
  const response = await api.get(`/movie/${id}/reviews`, {
    params: { id_usuario, skip, limit }
  });
  return response.data;
};
