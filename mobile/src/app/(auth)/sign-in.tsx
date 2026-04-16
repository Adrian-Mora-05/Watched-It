import { router } from 'expo-router';
import { useSession } from '@/hooks/ctx';
import { useRef, useState } from "react";
import { View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TextInput as RNTextInput, AccessibilityInfo } from "react-native";
import { Text, Pressable } from "@react-native-ama/react-native";
import { Form } from "@react-native-ama/forms";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { loginUser } from '@shared/user.schema';
import ErrorToast from '@/components/ui/ErrorMessage';
import { z } from 'zod';

type LoginErrors = Partial<Record<keyof z.infer<typeof loginUser>, string>>;

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [toastMessage, setToastMessage] = useState<string | undefined>();

  const passwordRef = useRef<RNTextInput>(null);

  const validateForm = (): boolean => {
    const result = loginUser.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors = {
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-dark"
      >
        <ErrorToast
          message={toastMessage}
          visible={!!toastMessage}
          onDismiss={() => setToastMessage(undefined)}
        />
        <View className="flex-1 bg-dark items-center justify-center p-4">

          <View className="items-center mb-12">
            <Text accessibilityRole="header" accessibilityLanguage="en-US" className="text-white text-4xl font-medium">
              Watched It
            </Text>
            <Text className="text-bone text-sm mt-2 opacity-60" accessibilityLanguage="es">
              Iniciar sesión
            </Text>
          </View>

          <View className="w-full gap-4" accessibilityLanguage="es">
            <Form onSubmit={() => false}>

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

              <Pressable
                className="self-end"
                accessibilityRole="button"
                accessibilityLabel="¿Olvidaste tu contraseña?"
                accessibilityLanguage="es"
              >
                <Text className="text-bone text-xs opacity-60 p-10 pt-0 pr-2">
                  ¿Olvidaste tu contraseña?
                </Text>
              </Pressable>

              <Button
                label="Iniciar sesión"
                loading={loading}
                onPress={async () => {
                  if (!validateForm()) return;

                  setLoading(true);
                  try {
                    await signIn({ email, password });
                    router.replace('/');
                  } catch (e) {
                    setToastMessage("Usuario o contraseña incorrectos.");
                  } finally {
                    setLoading(false);
                  }
                }}
              />
            </Form>
              <View
                className="flex-row items-center mt-16 gap-3"
                accessible={true}
                accessibilityLabel="¿No tienes una cuenta? Regístrate"
              >
                <Text className="text-bone text-sm opacity-60">
                  ¿No tienes una cuenta?
                </Text>
                <Button label="Regístrate" loading={loading} onPress={() => console.log("hola falta esto")} />
              </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}