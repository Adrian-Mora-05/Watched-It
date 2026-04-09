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
      accessibilityLabel={label}         
      accessibilityState={{ busy: loading, disabled: loading }}
      className="bg-primary rounded-xl py-4 items-center justify-center"
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