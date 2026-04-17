// components/ui/Input.tsx
import { View, TextInput, Text as RNText } from "react-native";
import { Text } from "@react-native-ama/react-native";

type InputProps = {
  label: string;
  error?: string;
  [key: string]: any;
};

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <View accessibilityLanguage="es" className="gap-1">
      <Text className="text-white text-base">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error || undefined}
        accessibilityState={{
          disabled: false,
          selected: !!error,
        }}
        className="bg-bone text-chocolate rounded-xl px-4 py-3"
        placeholderTextColor="#888"
        {...props}
      />
      {error ? (
            <Text
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        accessibilityLanguage="es"
        className="text-red text-base font-bold pl-2"
      >
        {error}
      </Text>
      ) : null}
    </View>
  );
}