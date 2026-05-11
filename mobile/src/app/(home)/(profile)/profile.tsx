import { ScrollView, View } from "react-native";
import { Text } from "@react-native-ama/react-native";
import TitleGrid from '@/components/ui/TitleGrid';
import { useFavorites } from '@/hooks/useFavorites';

export default function MyProfileScreen() {
  const { movies, shows } = useFavorites();

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
    </ScrollView>
  );
}