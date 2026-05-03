import api from "./api";
import {ReadCatalogParam} from "@shared/catalog.schema";

export const baseUrl = "https://m.media-amazon.com/images/M/"; // all the img urls start with this

export const getCatalog = async (param: ReadCatalogParam) => {
  const response = await api.get("/catalog/", { 
    params: param
  });
  return response.data.data;
};