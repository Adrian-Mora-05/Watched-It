import api from "./api";
import { CreateUser, LoginUser } from "@shared/user.schema";
import { ForgotPassword } from "@shared/password.schema";
import { uploadProfilePicture, addFavorites } from "./user.service";

export const signup = async (userData: CreateUser, photoUri?: string, favMovies?: number[], favShows?: number[] ) => {
  const response = await api.post("/auth/signup", userData);
  const { session } = response.data;

  if (photoUri) {
    await uploadProfilePicture(photoUri, session.access_token);
  }
  if (favMovies && favShows) {
    await addFavorites(favMovies, favShows, session.access_token);
  }
  return response.data;

};

export const login = async (userData: LoginUser) => {
  const response = await api.post("/auth/signin", userData);
  return response.data;
};

export const sendEmail = async (username:ForgotPassword ) => { 
  const response = await api.post("/auth/forgot-password", username);
  return response.data;
};

export async function resetPassword({
  accessToken,
  refreshToken,
  newPassword,
}: {
  accessToken: string;
  refreshToken: string;
  newPassword: string;
}) {
  const { data } = await api.post(
    '/auth/reset-password',
    { refreshToken, newPassword },
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  return data;
}