import api  from "./api";
import {LogCatalogContent} from "@shared/catalog.schema";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  profilePicture: string | null;
  createdAt: string;
}

export const getMe = async (token: string): Promise<UserProfile> => {
  const response = await api.get('/user/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadProfilePicture = async (photoUri: string, token: string) => {
  const formData = new FormData();

  formData.append('file', {
    uri: photoUri,
    name: 'profile-picture.png',
    type: 'image/png',
  } as any);

  await api.patch('/user/profile-picture', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const removeProfilePicture = async (token: string) => {
  await api.delete('/user/profile-picture', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addFavorites = async (favMovies: number[], favShows: number[], token: string) => {
  await api.post('/user/favorites', { movies: favMovies, shows: favShows }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const updateFavorites = async (
  favMovies: number[],
  favShows: number[],
  token: string
) => {

  const movies = favMovies.slice(0, 3);
  const shows = favShows.slice(0, 3);

  await api.put(
    '/user/favorites',
    {
      movies,
      shows
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
};

export const logContent = async (logCatalogContent: LogCatalogContent, token: string) => {
  await api.post('/user/rating', logCatalogContent, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};