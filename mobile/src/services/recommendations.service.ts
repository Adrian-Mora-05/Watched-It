import api from "./api";

export const baseUrl = "https://m.media-amazon.com/images/M/";

export const generateMovieRecommendations = async (token: string) => {
    const response = await api.post('/recommendations/movies/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const generateShowsRecommendations = async (token: string) => {
    const response = await api.post('/recommendations/shows/generate', {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getMoviesForYou = async (token: string) => {
    const response = await api.get('/recommendations/movies/for-you', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getMoviesHiddenGems = async (token: string) => {
    const response = await api.get('/recommendations/movies/hidden-gems', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getMoviesWorldCinema = async (token: string) => {
    const response = await api.get('/recommendations/movies/world-cinema', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getShowsForYou = async (token: string) => {
    const response = await api.get('/recommendations/shows/for-you', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getShowsHiddenGems = async (token: string) => {
    const response = await api.get('/recommendations/shows/hidden-gems', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const getShowsWorldCinema = async (token: string) => {
    const response = await api.get('/recommendations/shows/world-cinema', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};