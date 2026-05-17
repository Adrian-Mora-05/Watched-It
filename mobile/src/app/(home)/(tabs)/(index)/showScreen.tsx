import { View, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { getShowsForYou, getShowsHiddenGems, getShowsWorldCinema } from '@/services/recommendations.service';
import { useSession } from '@/hooks/ctx';
import { useLayout } from '@/hooks/useLayout';
import { useEffect, useState } from 'react';
import  ImageButton  from '@/components/ui/imageButton';
import { baseUrl } from '@/services/recommendations.service';
import { router } from 'expo-router';

interface Show {
  id: number;
  title: string;
  image_link: string;
  similitud: number;
}

interface SectionProps {
  title: string;
  shows: Show[];
  imgWidth: number;
  imgHeight: number;
  gap: number;
}

function ShowSection({ title, shows, imgWidth, imgHeight, gap }: SectionProps) {
  return (
    <View style={{ gap: gap*2}}>
      <Text className="text-white text-intermediate font-semibold">{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={shows}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ gap }}
        renderItem={({ item, index }) => (
          <ImageButton
            source={{ uri: `${baseUrl}${item.image_link}` }}
            width={imgWidth}
            height={imgHeight}
            rounded="md"
            accessibilityLabel={`Serie ${index + 1} de ${shows.length}`}
            accessibilityHint="Toca para ver más información"
            onPress={() => router.push(`/(home)/show/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

export default function ShowScreen() {
  const { screenWidth } = useLayout();
  const paddingHorizontal = screenWidth * 0.02;
  const { session } = useSession();
  const gap = screenWidth * 0.02;
  const imgWidth = screenWidth * 0.25;
  const imgHeight = imgWidth * 1.5;

  const [paraTi, setParaTi] = useState<Show[]>([]);
  const [joyasOcultas, setJoyasOcultas] = useState<Show[]>([]);
  const [cineMundial, setCineMundial] = useState<Show[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const [paraTiData, joyasData, cineMundialData] = await Promise.all([
          getShowsForYou(session!),
          getShowsHiddenGems(session!),
          getShowsWorldCinema(session!),
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
  }, [session]);

  if (loading) return <ActivityIndicator className="flex-1" color="white" />;

  return (
    <ScrollView
      className="flex-1 bg-dark"
      style={{ paddingHorizontal }}
      contentContainerStyle={{ gap: gap*2, paddingVertical: gap }}
    >
      <ShowSection title="Elegido para ti" shows={paraTi} imgWidth={imgWidth} imgHeight={imgHeight} gap={gap} />
      <ShowSection title="Joyas ocultas" shows={joyasOcultas} imgWidth={imgWidth} imgHeight={imgHeight} gap={gap} />
      <ShowSection title="¿Aburrido de Hollywood?" shows={cineMundial} imgWidth={imgWidth} imgHeight={imgHeight} gap={gap} />
    </ScrollView>
  );
}