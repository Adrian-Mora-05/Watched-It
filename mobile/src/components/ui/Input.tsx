import { View, TextInput } from "react-native";
import { Text } from "@react-native-ama/react-native";

type __InputProps__ = {
  label: string;
  error?: string;
  hideLabel?: boolean;
  [key: string]: any;
};

export default function Input({ label, error, hideLabel, ...props }: __InputProps__) {
  return (
    <View accessibilityLanguage="es" className="gap-1">
      <Text
        className="text-white text-normal"
        style={hideLabel ? {
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          opacity: 0,
        } : undefined}
      >
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
          className="text-red text-normal font-bold pl-2"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}