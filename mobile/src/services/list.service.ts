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


export const addToList = async (token: string, id: number, body: { tipo: string; nombre_lista: string }) => {
  const response = await api.post(`/list/${id}`, body, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const removeFromList = async (token: string, id: number, body: { tipo: string; nombre_lista: string }) => {
  const response = await api.delete(`/list/${id}`, {
    data: body,
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getMyLists = async ( skip = 0, limit = 15, token: string) => {
    const response = await api.get('/list/user-lists', {
      params: { skip, limit },
      headers: { Authorization: `Bearer ${token}` }
    });

    return response.data;
  };

  export const getPorVer = async (skip = 0, limit = 15, token: string) => {
  const response = await api.get('/list/por-ver', {
    params: { skip, limit },
    headers: { Authorization: `Bearer ${token}` }
  });

  return response.data;
};

export const createList = async (
  body: {
    nombre_lista: string;
    tipo: "pelicula" | "serie";
    id_contenido?: number;
  },
  token: string
) => {
  const response = await api.post('/list', body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteList = async (
  body: { nombre_lista: string; tipo: "pelicula" | "serie" },
  token: string
) => {
  const response = await api.delete('/list', {
    headers: { Authorization: `Bearer ${token}` },
    data: body,
  });
  return response.data;
};

export const renameList = async (
  body: { nombre_lista: string; nuevo_nombre: string; tipo: "pelicula" | "serie" },
  token: string
) => {
  const response = await api.patch('/list', body, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};