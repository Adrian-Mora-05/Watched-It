import api from "./api";
import { CreateUser } from "../../shared/user.schema";

export const signup = async (userData: CreateUser) => {
  const response = await api.post("/auth/signup", userData);
  return response.data;
};
