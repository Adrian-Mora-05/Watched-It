import { View, Image } from "react-native";
import { Text } from "@react-native-ama/react-native";
import { router, useLocalSearchParams } from "expo-router";
import ReturnButton from "@/components/ui/ReturnButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ChooseFavsScreen() {
  const insets = useSafeAreaInsets();
  const { email, password, name, photoUri } = useLocalSearchParams<{
    email: string;
    password: string;
    name: string;
    photoUri?: string;
  }>();

  const resolvedPhotoUri = Array.isArray(photoUri) ? photoUri[0] : photoUri;

  const profileSource = resolvedPhotoUri
    ? { uri: resolvedPhotoUri }
    : require('../../../assets/images/default-profile-pic.png');
    
  return (
    <View className="flex-1 bg-dark p-2" style={{ paddingTop: insets.top }}>
      <View className="py-2">
        <ReturnButton label="Volver" onPress={() => router.back()} />
      </View>
      <Text className="bg-white">Aca falta añadir peliculas/series favs</Text>
      <Text className="bg-white">{email}</Text>
      <Text className="bg-white">{password}</Text>
      <Text className="bg-white">{name}</Text>
      <Image
        source={profileSource}
        style={{ width: 100, height: 100 }}
        accessibilityLabel="Foto de perfil seleccionada"
      />

    </View>
  );
}