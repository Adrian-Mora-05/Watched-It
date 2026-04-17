import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text } from "@react-native-ama/react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
};

export default function ReturnButton({ label, onPress }: ButtonProps) {
  return (
    <Pressable
      accessibilityLanguage="es"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}
      className="rounded-xl p-4 items-center flex-row gap-2"
    >
      <Ionicons name="arrow-back" size={24} color="white" />
      <Text className="text-lg text-white">
        Volver
      </Text>
    </Pressable>

  );
}