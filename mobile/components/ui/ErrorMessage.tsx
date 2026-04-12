// components/ui/ErrorMessage.tsx
import { Text } from "@react-native-ama/react-native";

type ErrorMessageProps = {
  message?: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return (
    <Text
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      accessibilityLanguage="es"
      className="text-red text-base pl-2"
    >
      {message}
    </Text>
  );
}