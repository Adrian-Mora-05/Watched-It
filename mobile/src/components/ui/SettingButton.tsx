import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from "@react-native-ama/react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  onPress: () => void;
};

export default function SettingsButton({ onPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Ir a configuraciones"
        className="p-3 items-center justify-center min-h-[44px] min-w-[44px]"
      >
        <Ionicons name="settings-outline" size={30} color="white" />
        
      </Pressable>
  );
}