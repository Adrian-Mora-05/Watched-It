import { View, Image } from "react-native";
import { useRef, useState } from "react";
import { Text } from "@react-native-ama/react-native";
import { router, useLocalSearchParams } from "expo-router";
import ReturnButton from "@/components/ui/ReturnButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Button from "@/components/ui/Button";
import { signup } from "@/services/auth.service";
import ErrorToast from '@/components/ui/ErrorMessage';
import { useSession } from '@/hooks/ctx';

export default function ChooseFavsScreen() {
  //Getting the user data from the previous screen
  const { email, password, name, photoUri } = useLocalSearchParams<{
  email: string;
  password: string;
  name: string;
  photoUri?: string;
  }>();

  const insets = useSafeAreaInsets();
  const { signIn } = useSession();
  const resolvedPhotoUri = Array.isArray(photoUri) ? photoUri[0] : photoUri;
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | undefined>();
  const profileSource = resolvedPhotoUri
    ? { uri: resolvedPhotoUri }
    : require('../../../assets/images/default-profile-pic.png');

  return (
    <View className="flex-1 bg-dark p-2" style={{ paddingTop: insets.top }}>
      <ErrorToast
        message={toastMessage}
        visible={!!toastMessage}
        onDismiss={() => setToastMessage(undefined)} />
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
      <Button
        label="Registrarse"
        loading={loading}
        onPress={async () => {
          setLoading(true);
          try {
            await signup({ email, password, name }, resolvedPhotoUri);
            await signIn({ email, password });  // sets the session token
            router.replace('/(home)');      
          } catch (e) {
            setToastMessage("Usuario o correo ya registrado");
          } finally {
            setLoading(false);
          }
        }}
      />
    </View>
  );
}