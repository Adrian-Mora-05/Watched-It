import { View, Pressable } from "react-native";
import { Text } from "@react-native-ama/react-native";
import { baseUrl } from "@/services/movie.service";
import { useWindowDimensions } from "react-native";
import ImageButton from "@/components/ui/imageButton";

type Props = {
  title: string;
  image_link?: string;
  year: number;
  rating: number;
  day: number;
  onPress: () => void;
};

export default function DiaryEntryCard({
  title,
  image_link,
  year,
  rating,
  day,
  onPress
}: Props) {
  const { width } = useWindowDimensions();
  const posterWidth = width * 0.22;
  const posterHeight = posterWidth * 1.5;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center mb-5"
    >
      {/* DAY */}
      <View className="w-10">
        <Text className="text-white text-2xl font-bold">
          {day}
        </Text>
      </View>

      {/* POSTER */}
      {image_link ? (
        <ImageButton
          source={{ uri: `${baseUrl}${image_link}` }}
          width={posterWidth}
          height={posterHeight}
          rounded="md"
          accessibilityLabel={`Poster de ${title}`}
          accessibilityHint="Toca para ver más información"
          onPress={onPress}
        />
      ) : (
        <View
          className="rounded-xl overflow-hidden bg-gray-800"
          style={{ width: posterWidth, height: posterHeight }}
        />
      )}

      {/* INFO */}
      <View className="ml-3 flex-1">
        <Text className="text-white text-base font-semibold">
          {title}
        </Text>
        <Text className="text-gray-400 mt-1">
          {year}
        </Text>
        <Text className="text-orange mt-2">
          {"★".repeat(rating)}
        </Text>
      </View>
    </Pressable>
  );
}