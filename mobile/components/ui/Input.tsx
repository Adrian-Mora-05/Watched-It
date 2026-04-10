import { View, TextInput } from "react-native"; // regular RN TextInput
import { Text } from "@react-native-ama/react-native";

type InputProps = {
  label: string;
  error?: string;
  [key: string]: any;
};

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <View accessibilityLanguage="es" className="gap-1">
      <Text className="text-white text-sm">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error || undefined}
        accessibilityState={{
          disabled: false,
          selected: !!error,
        }}
        className="bg-bone text-white rounded-xl px-4 py-3"
        placeholderTextColor="#888"
        {...props}
      />
      {error && (
        <Text
          accessibilityRole="alert"
          className="text-red-400 text-xs"
        >
          {error}
        </Text>
      )}
    </View>
  );
}