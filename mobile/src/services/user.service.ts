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

  export type UserLog = {
    id: number; 

    type: 'movie' | 'series';

    content: string;
    rating: number;
    date: string;
    likes: number;

    catalog: {
      id: number;
      title: string;
      poster: string;
      year: number;
    };
  };

  export const getUserLogs = async (
    token: string
  ): Promise<UserLog[]> => {

    const response = await api.get('/user/logs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  };

  export const updateLogContent = async (
    logId: number,
    logCatalogContent: {
      content?: string;
      rating: number;
      type_content: "movie" | "show";
    },
    token: string
  ): Promise<void> => {
    await api.put(
      `/user/log/${logId}`,
      {
        content: logCatalogContent.content ?? null,
        rating: logCatalogContent.rating,
        type_content: logCatalogContent.type_content,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  export const deleteLogContent = async (
    logId: number,
    typeContent: string,
    token: string
  ) => {

    await api.delete(
      `/user/rating/${logId}?type_content=${typeContent}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  };

  export const getUserLogById = async (
    logId: number,
    type: string,
    token: string
  ): Promise<UserLog> => {
    const response = await api.get(`/user/log/${logId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        type,
      },
    });

    return response.data;
  };

  export type UserRatingStats = {
  total_calificaciones: number;
  cant_1: number;
  cant_2: number;
  cant_3: number;
  cant_4: number;
  cant_5: number;
};

export const getRatingStats = async (token: string): Promise<UserRatingStats> => {
  const response = await api.get('/user/rating-stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export type PublicUserProfile = {
  id: string;
  name: string;
  profilePicture: string | null;

  favoriteMovies: any[];
  favoriteShows: any[];

  relationStatus:
    | 'none'
    | 'request_sent'
    | 'request_received'
    | 'friends';
};

export const getPublicUserProfile = async (
  id: string,
  token: string
): Promise<PublicUserProfile> => {

  const response =
    await api.get(
      `/user/${id}/public`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  return response.data;
};

export const getPublicUserRatingStats = async (
  id: string,
  token: string
): Promise<UserRatingStats> => {

  const response =
    await api.get(
      `/user/${id}/rating-stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

  return response.data;
};

export const sendFriendRequest = async (
  userId: string,
  token: string
) => {

  await api.post(
    `/user/friend-request/${userId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};