import api from "./api";
import { ReadShowParam } from "@shared/show.schema";

export const baseUrl = "https://m.media-amazon.com/images/M/"; // all the img urls start with this

export const getShows = async (param: ReadShowParam) => {
  const response = await api.get("/show/", { 
    params: param
  });
  return response.data;
};

export const getFavoriteShowsByUser = async (token: string) => {
  const response = await api.get('/show/favorites', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const getShowById = async (id: number, id_user: string, name: string) => {
  const response = await api.get(`/show/${id}`, {
    params: { id_user, name }
  });
  return response.data;
};

export const getshowReviews = async (id: number, id_usuario: string, skip: number, limit: number) => {
  const response = await api.get(`/show/${id}/reviews`, {
    params: { id_usuario, skip, limit }
  });
  return response.data;
};
