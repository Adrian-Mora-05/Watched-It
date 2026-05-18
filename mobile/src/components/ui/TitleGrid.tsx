import { View } from "react-native";
import { Text } from "@react-native-ama/react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { baseUrl } from "@/services/movie.service";
import { useWindowDimensions } from 'react-native';
import ImageButton from "@/components/ui/imageButton";

type Props = {
  item?: {
    title: string;
    image_link?: string;
    contenido_id?: number;
    tipo?: 'pelicula' | 'serie'| 'show';
  };
  onPress: () => void;
};

export default function TitleGrid({ item, onPress }: Props) {
  const { width } = useWindowDimensions();
  const movieCardWidth = (width * 0.8) / 3;
  const movieCardHeight = movieCardWidth * 1.5;

  if (!item) {
    return (
      <View
        style={{ width: movieCardWidth, height: movieCardHeight }}
        className="bg-white/10 items-center justify-center rounded-xl"
      >
        <Ionicons name="add-circle" size={28} color="#0a9941" />
      </View>
    );
  }

  if (!item.image_link) {
    return (
      <View
        style={{ width: movieCardWidth, height: movieCardHeight }}
        className="bg-gray-800 items-center justify-center rounded-xl"
      >
        <Text className="text-white text-center px-1">{item.title}</Text>
      </View>
    );
  }

  return (
    <ImageButton
      source={{ uri: `${baseUrl}${item.image_link}` }}
      width={movieCardWidth}
      height={movieCardHeight}
      rounded="md"
      accessibilityLabel={item.title}
      accessibilityHint="Toca para ver más información"
      onPress={onPress}
    />
  );
}