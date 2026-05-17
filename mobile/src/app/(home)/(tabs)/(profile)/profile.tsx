import { ScrollView, View, ActivityIndicator  } from "react-native";
import { Text } from "@react-native-ama/react-native";
import TitleGrid from '@/components/ui/TitleGrid';
import { useFavorites } from '@/hooks/useFavorites';
import RatingBarChart from '@/components/ui/RatingBarChart';
import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/ctx';
import { getRatingStats, UserRatingStats } from '@/services/user.service';

export default function MyProfileScreen() {
  const { movies, shows } = useFavorites();
  const { session } = useSession();
  const [ratingStats, setRatingStats] = useState<UserRatingStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  useEffect(() => {
    if (!session) return;
    const load = async () => {
      setIsLoadingStats(true);
      try {
        setRatingStats(await getRatingStats(session));
      } finally {
        setIsLoadingStats(false);
      }
    };
    load();
  }, [session]);

  const uniqueMovies = Array.from(
    new Map(movies.map(m => [m.id, m])).values()
  );
  const uniqueShows = Array.from(
      new Map(shows.map(s => [s.id, s])).values()
  );
  const peliculasMostradas = [...uniqueMovies.slice(0, 3)];
    while (peliculasMostradas.length < 3) {
    peliculasMostradas.push(null);
  }
  const showsMostrados = [...uniqueShows.slice(0, 3)];
    while (showsMostrados.length < 3) {
        showsMostrados.push(null);
  }

  return (
    <ScrollView className="flex-1 bg-dark">
      <View className='py-6'>
        <Text className="text-white text-medium font-semibold">
            Mis Películas Favoritas
        </Text>
        <View className="py-6 flex-row justify-around">
          {peliculasMostradas.map((pelicula, index) => (
            <TitleGrid
              key={pelicula?.id || index}
              item={pelicula}  
              onPress={() => {}}
            />
        ))}
      </View>
      </View>
          <Text className="text-white text-medium font-semibold">
                Mis Series Favoritas
            </Text>
            <View className="py-6 flex-row justify-around">
              {showsMostrados.map((show, index) => (
                <TitleGrid
                  key={show?.id || index}
                  item={show}  
                  onPress={() => {}}
                />
            ))}
          </View>
      <View className="py-6">
        <Text className="text-white text-medium font-semibold mb-4">
          Mis Calificaciones
        </Text>
        {isLoadingStats || !ratingStats ? (
          <ActivityIndicator color="#D9D9D9" />
        ) : (
          <RatingBarChart {...ratingStats} />
        )}
      </View>
    </ScrollView>
  );
}