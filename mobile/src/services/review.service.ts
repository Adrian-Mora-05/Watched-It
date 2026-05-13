import api from "./api";

export const baseUrl = "https://m.media-amazon.com/images/M/"; // all the img urls start with this

export const getReviews = async (skip = 0, limit = 15, token: string) => {
  const response = await api.get('/review', {
    params: { skip, limit },
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data;
};

export const addLike = async (id: number, tipo: string, token: string) => {
  const response = await api.post(`/review/${id}/like`, 
    { tipo },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const removeLike = async (id: number, tipo: string, token: string) => {
  const response = await api.delete(`/review/${id}/like`,
    { 
      data: { tipo },  
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};