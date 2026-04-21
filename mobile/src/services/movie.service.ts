import api from "./api";
import { ReadMovieParam } from "@shared/movie.schema";

export const baseUrl = "https://m.media-amazon.com/images/M/"; // all the img urls start with this

export const getMovies = async (param: ReadMovieParam) => {
  const response = await api.get("/movie/", { 
    params: param
  });
  return response.data;
};