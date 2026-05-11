import React, { createContext, useContext, useEffect, useState } from "react";
import { getFavoriteMoviesByUser } from "@/services/movie.service";
import { getFavoriteShowsByUser } from "@/services/show.service";
import { useSession } from "@/hooks/ctx";

type FavoritesContextType = {
  movies: any[];
  shows: any[];
  loading: boolean;
  refetch: () => Promise<void>;
};

export const FavoritesContext = createContext<FavoritesContextType | null>(null);

const removeDuplicates = (arr: any[]) => {
  return Array.from(new Map(arr.map(item => [item?.id, item])).values());
};

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { session, user } = useSession();

  const [movies, setMovies] = useState<any[]>([]);
  const [shows, setShows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!session) return;

    setLoading(true);

    try {
      const [moviesRes, showsRes] = await Promise.all([
        getFavoriteMoviesByUser(session),
        getFavoriteShowsByUser(session),
      ]);

      setMovies(removeDuplicates(moviesRes || []));
      setShows(removeDuplicates(showsRes || []));
    } catch (error) {
      console.log("Error cargando favoritos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user?.id]);

  return (
    <FavoritesContext.Provider
      value={{
        movies,
        shows,
        loading,
        refetch: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}