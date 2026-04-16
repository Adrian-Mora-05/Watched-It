import { ActivityIndicator, View } from "react-native";
import { Pressable, Text } from "@react-native-ama/react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

export default function Button({ label, onPress, loading }: ButtonProps) {
  return (
    <Pressable
      accessibilityLanguage="es"
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}         
      accessibilityState={{ busy: loading, disabled: loading }}
      className="bg-orange rounded-xl p-4 items-center justify-center"
    >
      {loading
        ? <ActivityIndicator color="white" />
        : <Text accessibilityLanguage="es" className="text-white font-semibold">
            {label}
          </Text>
      }
    </Pressable>
  );
}