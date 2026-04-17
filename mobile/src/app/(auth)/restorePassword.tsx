import { View } from "react-native";
import { Text } from "@react-native-ama/react-native";
import { router } from "expo-router";
import ReturnButton from "@/components/ui/ReturnButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RestorePasswordScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-dark p-2" style={{ paddingTop: insets.top }} >
      <View className="py-2">
        <ReturnButton label="Volver" onPress={() => router.back()} />
      </View>

      <Text className="bg-white">aqui se recupera contraseña</Text>
    </View>
  );
}