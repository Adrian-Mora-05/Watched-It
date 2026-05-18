import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text } from "@react-native-ama/react-native";
import { View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ButtonProps = {
  label: string;
  onPress: () => void;
  showLabel?: boolean;
};

export default function ReturnButton({ label, onPress, showLabel = true }: ButtonProps) {
  return (
    <View>
    <Pressable
        accessibilityLanguage="es"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLiveRegion="polite"
        accessibilityLabel={label}
        className="rounded-xl items-center flex-row gap-2"
        style={{ minWidth: 48, minHeight: 48, padding: 10, alignItems: 'center', justifyContent: 'center' }}
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