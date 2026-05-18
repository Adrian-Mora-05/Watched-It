import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from "@react-native-ama/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onPress: () => void;
};

export default function SettingsButton({ onPress }: Props) {

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Ir a configuraciones"
      className="items-center justify-center"
      style={{
        width: 48,
        height: 48,
      }}
      hitSlop={8}
    >
      <Ionicons name="settings-outline" size={26} color="white" />
    </Pressable>
  );
}