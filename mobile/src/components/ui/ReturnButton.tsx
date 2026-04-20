import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text } from "@react-native-ama/react-native";
import { View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ButtonProps = {
  label: string;
  onPress: () => void;
};

export default function ReturnButton({ label, onPress }: ButtonProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top }}>
      <Pressable
        accessibilityLanguage="es"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLiveRegion="polite"
        accessibilityLabel={label}
        className="rounded-xl p-4 items-center flex-row gap-2"
      >
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text className="text-normal text-white">
          Volver
        </Text>
      </Pressable>
    </View>

  );
}