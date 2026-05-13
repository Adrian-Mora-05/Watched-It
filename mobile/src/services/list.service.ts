import api from "./api";

export const baseUrl = "https://m.media-amazon.com/images/M/"; // all the img urls start with this

export const getLists = async (skip = 0, limit = 15, token: string) => {
  const response = await api.get('/list', {
    params: { skip, limit },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;

};

export const getListById = async (id: number, token: string) => {
  const response = await api.get(`/list/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};