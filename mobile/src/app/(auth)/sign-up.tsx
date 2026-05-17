import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from "react";
import { View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TextInput as RNTextInput, AccessibilityInfo, Modal, ScrollView,} from "react-native";

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
import { useSession } from '@/hooks/ctx';
import { useLayout } from '@/hooks/useLayout';

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
  const { headerHeight, screenWidth,  paddingHorizontal, paddingVertical } = useLayout();
  const gap = screenWidth * 0.03;
  const imgWidth = screenWidth * 0.28;
  const imgHeight = imgWidth * 1.5;
  const passwordRef = useRef<RNTextInput>(null);

  const handlePhoto = (uri: string) => {
    setPhotoUri(uri);
    setShowCamera(false);
  };

  const validateForm = (): boolean => {
    const result = createUser.safeParse({
      email,
      password,
      name,
    });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      const newErrors = {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        name: fieldErrors.name?.[0],
      };

      setErrors(newErrors);

      const errorMessages = Object.values(newErrors)
        .filter(Boolean)
        .join('. ');

      AccessibilityInfo.announceForAccessibility(
        `Errores en el formulario: ${errorMessages}`
      );

      return false;
    }

    setErrors({});
    return true;
  };

  return (
    <View className="flex-1 bg-dark" style={{  paddingHorizontal, paddingVertical }}>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-dark"
        >
          <ErrorToast
            message={toastMessage}
            visible={!!toastMessage}
            onDismiss={() => setToastMessage(undefined)}
          />

          <View className="w-full items-start justify-end" style={{height: headerHeight}}>
            <ReturnButton
              label="Volver"
              onPress={() => router.back()}
            />
          </View>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >


              {/* Header */}
              <View className="items-center pt-6 pb-8">
                <Text
                  className="text-white text-large font-bold"
                  accessibilityLanguage="es"
                  accessibilityRole="header"
                >
                  Registrarse
                </Text>
              </View>

              {/* Form */}
              <View className="flex-1" style={{ gap }}>
                <Form onSubmit={() => false}>

                  <Input
                    label="Nombre"
                    placeholder="usuario123"
                    value={name}
                    onChangeText={(text: string) => {
                      setName(text);
                      setErrors({});
                    }}
                    keyboardType="default"
                    autoCapitalize="none"
                    autoComplete="username"
                    nextFormField={passwordRef}
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
                    nextFormField={passwordRef}
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
                    ref={passwordRef}
                    error={errors.password}
                  />

                  {/* Foto de perfil */}
                  <View className="mt-6 items-center">

                    <Text
                      className="text-normal text-white pb-4"
                      accessibilityLanguage="es"
                    >
                      Agregar foto de perfil
                    </Text>

                    <View className="relative">

                      <ImageButton
                        borderColor="grey"
                        borderWidth={1}
                        size={150}
                        source={
                          photoUri
                            ? { uri: photoUri }
                            : require('../../../assets/images/camera-icon.png')
                        }
                        rounded="md"
                        onPress={() => setShowCamera(true)}
                        accessibilityLabel="Foto de perfil"
                        accessibilityHint="Agrega una foto de perfil"
                      />

                      {photoUri && (
                        <TouchableOpacity
                          onPress={() => setPhotoUri(null)}
                          accessibilityRole="button"
                          accessibilityLabel="Eliminar foto de perfil"
                          className="absolute -top-2 -right-2"
                          style={{minWidth: 44, minHeight: 44, }} >
                          <View className="bg-red rounded-full">
                            <Feather
                              name="x-circle"
                              size={gap * 4}
                              color="white"
                            />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Cámara */}
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

                  {/* Botón */}
                  <View className="pt-10 pb-6">
                    <Button
                      label="Continuar"
                      loading={loading}
                      onPress={async () => {

                        if (!validateForm()) return;

                        router.push({
                          pathname: "/chooseMovieFavs",
                          params: {
                            email,
                            password,
                            name,
                            photoUri,
                          }
                        });
                      }}
                    />
                  </View>

                </Form>
              </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
}