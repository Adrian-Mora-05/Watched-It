import { View, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { getMoviesForYou, getMoviesHiddenGems, getMoviesWorldCinema } from '@/services/recommendations.service';
import { useSession } from '@/hooks/ctx';
import { useLayout } from '@/hooks/useLayout';
import { useEffect, useState } from 'react';
import  ImageButton  from '@/components/ui/imageButton';
import { baseUrl } from '@/services/recommendations.service';
import { router } from 'expo-router';

interface Movie {
  id: number;
  title: string;
  image_link: string;
  similitud: number;
}

interface SectionProps {
  title: string;
  movies: Movie[];
  imgWidth: number;
  imgHeight: number;
  gap: number;
}

function MovieSection({ title, movies, imgWidth, imgHeight, gap }: SectionProps) {
  return (
    <View style={{ gap: gap*2}}>
      <Text className="text-white text-intermediate font-semibold">{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap }}
        renderItem={({ item, index }) => (
          <ImageButton
            source={{ uri: `${baseUrl}${item.image_link}` }}
            width={imgWidth}
            height={imgHeight}
            rounded="md"
            accessibilityLabel={`Película ${index + 1} de ${movies.length}`}
            accessibilityHint="Toca para ver más información"
            onPress={() => router.push(`/(home)/movie/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

export default function MovieScreen() {
  const { screenWidth } = useLayout();
  const paddingHorizontal = screenWidth * 0.02;
  const { session } = useSession();
  const gap = screenWidth * 0.02;
  const imgWidth = screenWidth * 0.25;
  const imgHeight = imgWidth * 1.5;

  const [paraTi, setParaTi] = useState<Movie[]>([]);
  const [joyasOcultas, setJoyasOcultas] = useState<Movie[]>([]);
  const [cineMundial, setCineMundial] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    const fetchRecommendations = async () => {
      try {
        const [paraTiData, joyasData, cineMundialData] = await Promise.all([
          getMoviesForYou(session),
          getMoviesHiddenGems(session),
          getMoviesWorldCinema(session),
        ]);
        setParaTi(paraTiData);
        setJoyasOcultas(joyasData);
        setCineMundial(cineMundialData);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [session]); // re-runs once session is available

  if (loading) return <ActivityIndicator className="flex-1" color="white" />;

  return (
    <ScrollView
      className="flex-1 bg-dark"
      style={{ paddingHorizontal }}
      contentContainerStyle={{ gap: gap*2, paddingVertical: gap }}
    >
      <MovieSection title="Elegido para ti" movies={paraTi} imgWidth={imgWidth} imgHeight={imgHeight} gap={gap} />
      <MovieSection title="Joyas ocultas" movies={joyasOcultas} imgWidth={imgWidth} imgHeight={imgHeight} gap={gap} />
      <MovieSection title="¿Aburrido de Hollywood?" movies={cineMundial} imgWidth={imgWidth} imgHeight={imgHeight} gap={gap} />
    </ScrollView>
  );
}