import { router } from 'expo-router';
import { useRef, useState } from "react";
import { View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TextInput as RNTextInput, AccessibilityInfo, Alert, Modal } from "react-native";
import { Text, TouchableOpacity } from "@react-native-ama/react-native";
import { Form } from "@react-native-ama/forms";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { createUser } from '@shared/user.schema';
import ErrorToast from '@/components/ui/ErrorMessage';
import { z } from 'zod';
import ReturnButton from "@/components/ui/ReturnButton";
import ImageButton from '@/components/ui/imageButton';
import { CameraModule } from '@/components/camera/CameraProvider';
import Feather from '@expo/vector-icons/Feather';

type SignUpErrors = Partial<Record<keyof z.infer<typeof createUser>, string>>;

export default function SignUp() {

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [toastMessage, setToastMessage] = useState<string | undefined>();
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handlePhoto = (uri: string) => {
    setPhotoUri(uri);
    setShowCamera(false);
  };
  const passwordRef = useRef<RNTextInput>(null);

  const validateForm = (): boolean => {
    const result = createUser.safeParse({ email, password, name });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors = {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        name: fieldErrors.name?.[0],

      };
      setErrors(newErrors);
      const errorMessages = Object.values(newErrors).filter(Boolean).join('. ');
      AccessibilityInfo.announceForAccessibility(`Errores en el formulario: ${errorMessages}`);
      return false;
    }

    setErrors({});
    return true;
  };

  return (
      <View className="bg-dark flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-dark"
      >
        <ErrorToast
          message={toastMessage}
          visible={!!toastMessage}
          onDismiss={() => setToastMessage(undefined)} />

        <View className="content-start items-center h-1/4 bg-dark justify-around mt-10">
          <ReturnButton label="Volver" onPress={() => router.back()} />
          <Text className="text-white text-large font-bold " accessibilityLanguage="es" accessibilityRole="header">
            Registrarse
          </Text>
        </View>

        <View className="flex-1 bg-dark items-center justify-center p-4">
          <View className="w-full h-full gap-5 pt-5" accessibilityLanguage="es">
            <Form onSubmit={() => false}>
              <Input
                label="Nombre"
                placeholder="nombre_usuario123"
                value={name}
                onChangeText={(text: string) => {
                  setName(text);
                  setErrors({});
                }}
                keyboardType="default"
                autoCapitalize="none"
                autoComplete="username"
                nextFormField={passwordRef as unknown as React.RefObject<RNTextInput>}
                hasValidation={false}
                error={errors.name}
              />
              <Input
                label="Correo electrónico"
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={(text: string) => {
                  setEmail(text);
                  setErrors({});
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                nextFormField={passwordRef as unknown as React.RefObject<RNTextInput>}
                hasValidation={false}
                error={errors.email}
              />

              <Input
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChangeText={(text: string) => {
                  setPassword(text);
                  setErrors({});
                }}
                secureTextEntry
                accessibilityLanguage="es"
                ref={passwordRef as unknown as React.RefObject<RNTextInput>}
                error={errors.password}
              />
              <Text className="text-normal text-white" accessibilityLanguage="es">
                Agregar foto de perfil
              </Text>

              <View className="relative w-44 ">
                <ImageButton
                  size={150}
                  
                  source={
                    photoUri
                      ? { uri: photoUri }
                      : require('../../../assets/images/camera-icon.png')
                  }
                  rounded="full"
                  onPress={() => setShowCamera(true)}
                  accessibilityLabel="Foto de perfil"
                  accessibilityHint="Agrega una foto de perfil"
                />

                {photoUri && (
                  <TouchableOpacity
                    onPress={() => setPhotoUri(null)}
                    accessibilityRole="button"
                    accessibilityLabel="Eliminar foto de perfil"
                    className="absolute -top-4 left-36 w-14 h-14 rounded-full items-center justify-center"
                  >
                    <View className="bg-red rounded-full">
                      <Feather name="x-circle" size={35} color="white" />
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <Modal visible={showCamera} animationType="slide" presentationStyle="fullScreen">
                <CameraModule
                  onClose={() => setShowCamera(false)}
                  onPhoto={handlePhoto}
                />
              </Modal>

            <View className="pt-5" />
              <Button
                label="Continuar"
                loading={loading}
                onPress={async () => {
                  if (!validateForm()) return;
                  router.push({ pathname: "/chooseFavs", params: { email: email, password: password, name: name, photoUri: photoUri } })
                }}
              />
            </Form>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
    </View>
  );
}