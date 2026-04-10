import { router } from 'expo-router';
import { useSession } from '../../hooks/ctx';
import { useRef, useState } from "react";
import { View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TextInput as RNTextInput } from "react-native";
import { Text, Pressable } from "@react-native-ama/react-native";
import { Form, TextInput } from "@react-native-ama/forms";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import ErrorMessage from "../../components/ui/ErrorMessage";

export default function SignIn() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordRef = useRef<RNTextInput>(null);

  const handleLogin = async (): Promise<boolean> => {
    if (!email) {
      setError('El correo electrónico es obligatorio');
      return false;
    }
    if (!password) {
      setError('La contraseña es obligatoria');
      return false;
    }

    setLoading(true);
    setError('');
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
      return true;
    } catch {
      setError('Correo o contraseña inválidos.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View accessibilityLanguage="es" className="flex-1 bg-dark items-center justify-center p-4">

          <View accessibilityLanguage="es" className="items-center mb-12 ">
            <Text accessibilityRole="header" accessibilityLanguage="en-US" className="text-white text-4xl font-medium">
              Watched It
            </Text>
            <Text accessibilityLanguage="es" className="text-bone text-sm mt-2 opacity-60">
              Iniciar sesión
            </Text>
          </View>

          <View className="w-full gap-4">
             <Form onSubmit={handleLogin}>

            <Input label="Correo electrónico" placeholder="ejemplo@correo.com" value={email} 
              onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email"
              nextFormField={passwordRef as unknown as React.RefObject<RNTextInput>} hasValidation={false} />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              ref={passwordRef as unknown as React.RefObject<RNTextInput>}
              error={error}
            />

            <Pressable 
              className="self-end"
              accessibilityRole="button"
              accessibilityLanguage="es"
              accessibilityLabel="¿Olvidaste tu contraseña?"
            >
              <Text className="text-bone text-xs opacity-60 p-10 pt-0 pr-2">
                ¿Olvidaste tu contraseña?
              </Text>
            </Pressable>

            <Button
              label="Iniciar sesión"
              loading={loading}
              onPress={async () => {
                const success = await handleLogin();
                if (success) {
                  signIn();
                  router.replace('/');
                }
              }}
            />

            <View
              className="flex-row items-center mt-16 gap-3"
              accessible={true}
              accessibilityLanguage="es"
              accessibilityLabel="¿No tienes una cuenta? Regístrate"
            >
              <Text className="text-bone text-sm opacity-60">
                ¿No tienes una cuenta?
              </Text>
              <Button label="Regístrate" loading={loading} onPress={handleLogin} />
            </View>

          </Form>
         </View> 
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
