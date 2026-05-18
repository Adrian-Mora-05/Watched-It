import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text } from "@react-native-ama/react-native";

type __Props__ = {
  onPress: () => void;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "close" | "save" | "cancel";
};

export default function ActionButton({
  onPress,
  label,
  icon,
  variant = "close",
}: __Props__) {
  const config = {
    close: {
      icon: icon ?? "close-outline",
      color: "white",
      background: "#231709",
      hint: "Cerrar",
    },
    save: {
      icon: icon ?? "checkmark-outline",
      color: "white",
      background: "#0a9941",
      hint: "Guardar los cambios",
    },
    cancel: {
      icon: icon ?? "close-outline",
      color: "white",
      background: "#cc2222",
      hint: "Cancelar la operación",
    },
  };

  const selected = config[variant];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityLiveRegion="polite"
      accessibilityHint={selected.hint}
      className="rounded-xl p-4 items-center flex-row gap-2 min-h-[44px]"
      style={{ backgroundColor: selected.background }}
    >
      <Ionicons name={selected.icon} size={24} color={selected.color} />
      <Text
        className="text-normal"
        style={{ color: selected.color }}
      >
        {label}
      </Text>
    </Pressable>
  );
}