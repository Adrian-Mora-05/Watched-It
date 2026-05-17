import api from "./api";

// LISTS
export const getListsOrSearch = async (
  token: string,
  param?: {
    name?: string;
    skip?: number;
    limit?: number;
  }
) => {
  const response = await api.get("/list", {
    params: param,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// USERS
export const searchUsers = async (
  token: string,
  param?: {
    name?: string;
    skip?: number;
    limit?: number;
  }
) => {
  const response = await api.get("/user/search", {
    params: param,
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// MOVIES (no auth)
export const getAllMovies = async (param?: {
  title?: string;
  year?: number;
  country?: string;
  genres?: string;
  minLength?: number;
  ageRestriction?: boolean;
  skip?: number;
  limit?: number;
}) => {
  const response = await api.get("/movie", { params: param });
  return response.data;
};

// SHOWS (no auth)
export const getAllShows = async (param?: {
  title?: string;
  year?: number;
  country?: string;
  genres?: string;
  ageRestriction?: boolean;
  skip?: number;
  limit?: number;
}) => {
  const response = await api.get("/show", { params: param });
  return response.data;
};