import api from "./api";
import { ReadShowParam } from "@shared/show.schema";

export const baseUrl = "https://m.media-amazon.com/images/M/"; // all the img urls start with this

export const getShows = async (param: ReadShowParam) => {
  const response = await api.get("/show/", { 
    params: param
  });
  return response.data;
};