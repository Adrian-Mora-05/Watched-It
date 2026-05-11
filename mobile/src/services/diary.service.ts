import api from './api';

export const getDiaryEntries = async (
  token: string,
  params?: {
    skip?: number;
    limit?: number;
  }
) => {

  const response = await api.get('/diary', {
    params,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.data;
};