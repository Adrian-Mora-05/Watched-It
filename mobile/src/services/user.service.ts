import api  from "./api";
import {LogCatalogContent} from "@shared/catalog.schema";

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

export const addFavorites = async (favMovies: number[], favShows: number[], token: string) => {
  await api.post('/user/favorites', { movies: favMovies, shows: favShows }, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

export const logContent = async (logCatalogContent: LogCatalogContent, token: string) => {
  await api.post('/user/rating', logCatalogContent, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });


}