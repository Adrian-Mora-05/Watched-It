import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text } from "@react-native-ama/react-native";
import { View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

type __ButtonProps__ = {
  label: string;
  onPress: () => void;
  showLabel?: boolean;
};

export default function ReturnButton({ label, onPress, showLabel = true }: __ButtonProps__) {
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
        {showLabel && (
          <Text className="text-normal text-white">
            Volver
          </Text>
        )}
      </Pressable>
    </View>
  );
}