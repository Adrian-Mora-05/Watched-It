import api from "./api";

export const getAvatarUrl = (path: string) =>
  `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile_pics/${path}`;

export const getFriendRequests = async (token: string) => {

  const response = await api.get('/friend/request/', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const getFriend = async (token: string) => {

  const response = await api.get('/friend/', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
};

export const acceptFriendRequest = async (token: string, requestId: number) => {
  try {
    const response = await api.patch(`/friend/request/${requestId}`, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const denyFriendRequest = async (token: string, requestId: number) => {
  const response = await api.delete(`/friend/request/${requestId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.data;
};