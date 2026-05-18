import { View, Pressable, Modal } from "react-native";
import { Text, TouchableOpacity } from "@react-native-ama/react-native";
import Feather from '@expo/vector-icons/Feather';
import ImageButton from '@/components/ui/imageButton';
import { useEffect, useState } from "react";
import { CameraModule } from '@/components/camera/CameraProvider';

type Props = {
  initialPhoto?: string | null; // foto que viene del backend
  onChange?: (uri: string | null) => void; // callback para guardar
};

export default function ProfilePhotoSection({
  initialPhoto = null,
  onChange
}: Props) {

  const [photoUri, setPhotoUri] = useState<string | null>(initialPhoto);
  const [showCamera, setShowCamera] = useState(false);
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
  
  const getProfilePhotoUrl = (path?: string | null) => {
  if (!path) return null;

  if (path.startsWith('http')) {
    return `${path}${path.includes('?') ? '&' : '?'}t=${Date.now()}`;
  }

  return `${SUPABASE_URL}/storage/v1/object/public/profile_pics/${path}?t=${Date.now()}`;
};

  const handlePhoto = (uri: string) => {
    setPhotoUri(uri); 
    setShowCamera(false);
    onChange?.(uri);
  };

  useEffect(() => {
  setPhotoUri(initialPhoto ?? null);
}, [initialPhoto]);

  return (
    <View className="items-center flex-row gap-8 justify-evenly ">

      {/* Botón texto */}
      <Pressable
        onPress={() => setShowCamera(true)}
        accessibilityLabel="Cambiar foto de perfil"
      >
        <Text className="text-white text-medium font-semibold">
          Cambiar foto de perfil
        </Text>
      </Pressable>

      {/* Imagen */}
      <View className="relative">
        <ImageButton
            borderWidth={1}
            size={60}
            source={
                photoUri
                ? {uri: photoUri.startsWith('file://')
                ? photoUri
                : getProfilePhotoUrl(photoUri) || undefined
            }
                : require('../../assets/images/default-profile-pic.png')
        }
            rounded="md"
            onPress={() => setShowCamera(true)}
            accessibilityLabel="Foto de perfil"
            accessibilityHint="Agrega una foto de perfil"
        />

        {/* Botón eliminar */}
        {photoUri && (
          <TouchableOpacity
            onPress={() => {
              setPhotoUri(null);
              onChange?.(null);
            }}
            accessibilityRole="button"
            accessibilityLabel="Eliminar foto de perfil"
            className="absolute top-2 left-36 w-14 h-14 rounded-full items-center justify-center"
            >
            <View className="bg-red rounded-full">
              <Feather name="x-circle" size={28} color="white" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal cámara */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CameraModule
          onClose={() => setShowCamera(false)}
          onPhoto={handlePhoto}
        />
      </Modal>

    </View>
  );
}