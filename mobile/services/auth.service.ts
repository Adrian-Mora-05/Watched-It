import api from "./api";
import { CreateUser, LoginUser } from "../../shared/user.schema";

export const signup = async (userData: CreateUser) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};

export const login = async (userData: LoginUser) => {
  const response = await api.post("/auth/signin", userData);
  return response.data;
};
