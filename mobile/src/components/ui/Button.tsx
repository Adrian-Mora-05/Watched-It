import { ActivityIndicator } from "react-native";
import { Pressable, Text } from "@react-native-ama/react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({ label, onPress, loading, disabled }: ButtonProps) {
  return (
    <Pressable
      accessibilityLanguage="es"
      onPress={onPress}
      disabled={loading || disabled}
      accessibilityRole="button"
      accessibilityLiveRegion="polite"
      accessibilityLabel={label}         
      accessibilityState={{ busy: loading, disabled: loading || disabled }}
      className={`rounded-xl p-5 items-center justify-center ${disabled ? ' bg-yellow-950' : 'bg-orange'}`}
    >
      {loading
        ? <ActivityIndicator color="white" />
        : <Text accessibilityLanguage="es" className="text-white font-semibold text-normal">
            {label}
          </Text>
      }
    </Pressable>
  );
}