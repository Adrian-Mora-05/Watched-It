import { View, Pressable, Image } from "react-native";
import { Text } from "@react-native-ama/react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { baseUrl } from "@/services/movie.service"; 
import { useWindowDimensions } from 'react-native';
import { useLayout } from "@/hooks/useLayout";

type Props = {
  item?: {
    title: string;
    image_link?: string;
  };
  onPress: () => void;
};

export default function TitleGrid({ item, onPress }: Props) {
  const { width } = useWindowDimensions();
  const movieCardWidth = (width * 0.8) / 3;
  const movieCardHeight = movieCardWidth * 1.5;

  const { paddingVertical } = useLayout();

  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl overflow-hidden"
    >
      {item ? (
        <View className="flex-row w-full bg-gray-800"  style={{ width: movieCardWidth, height: movieCardHeight }}>
          
          {item.image_link ? (
            <Image
              source={{ uri: baseUrl + item.image_link }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
          
            <View className="flex-1 items-center justify-center">
              <Text className="text-white text-center px-1">
                {item.title}
              </Text>
            </View>
          )}

        </View>
      ) : (
       
        <View className="flex-1 w-full bg-white/10 items-center justify-center">
          <Ionicons name="add-circle" size={28} color="#0a9941" />
        </View>
      )}
    </Pressable>
  );
}