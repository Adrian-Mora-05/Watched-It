import api from "./api";
import { CreateUser, LoginUser } from "@shared/user.schema";

export const signup = async (userData: CreateUser, photoUri?: string) => {
  const response = await api.post("/auth/signup", userData);
  const { session } = response.data;

  if (photoUri) {
    await uploadProfilePicture(photoUri, session.access_token);
  }
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

export const login = async (userData: LoginUser) => {
  const response = await api.post("/auth/signin", userData);
  return response.data;
};
