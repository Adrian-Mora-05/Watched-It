import {
  View,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
} from "react-native";
import { Text } from "@react-native-ama/react-native";
import { router, useLocalSearchParams } from "expo-router";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { z } from 'zod';
import { resetPassword } from "@/services/auth.service";
import { replace } from "expo-router/build/global-state/routing";

type ScreenState = "idle" | "loading" | "success" | "error";
export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});
export default function ResetPasswordScreen() {
  const { access_token, refresh_token } = useLocalSearchParams<{
    access_token: string;
    refresh_token: string;
    
  }>();
const params = useLocalSearchParams();
console.log('All params:', JSON.stringify(params));
console.log('access_token:', access_token);
console.log('refresh_token:', refresh_token);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [apiError, setApiError] = useState<string>("");

  // Guard: if tokens are missing the deep link was malformed or expired
  if (!access_token || !refresh_token) {
    return (
      <View className="bg-dark flex-1 items-center justify-center m-5 gap-6">
        <Text
          className="text-white text-large font-bold text-center"
          accessibilityRole="header"
        >
          Enlace inválido
        </Text>
        <Text className="text-white text-medium text-center">
          Este enlace expiró o es inválido. Solicita un nuevo correo de
          restablecimiento.
        </Text>
        <Button
          label="Volver a inicio de sesión"
          onPress={() => console.log("Navigate to login")}
        />
      </View>
    );
  }

  const validateForm = (): boolean => {
    const result = ResetPasswordSchema.safeParse({ newPassword, confirmPassword });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors = {
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      };
      setErrors(newErrors);
      const errorMessages = Object.values(newErrors).filter(Boolean).join(". ");
      AccessibilityInfo.announceForAccessibility(
        `Errores en el formulario: ${errorMessages}`
      );
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = () => {
    setApiError("");
    if (!validateForm()) return;

    setScreenState("loading");

    resetPassword({
      accessToken: access_token,
      refreshToken: refresh_token,
      newPassword,
    })
      .then(() => {
        setScreenState("success");
        AccessibilityInfo.announceForAccessibility(
          "Contraseña actualizada exitosamente. Ya puedes iniciar sesión."
        );
      })
      .catch((error:any) => {
        console.error("Error resetting password:", error);
        const message =
          "No pudimos actualizar tu contraseña. El enlace puede haber expirado.";
        setApiError(message);
        setScreenState("error");
        AccessibilityInfo.announceForAccessibility(`Error: ${message}`);
      });
  };

  if (screenState === "success") {
    return (
      <View className="bg-dark flex-1 items-center justify-center m-5 gap-10">
        <Text
          className="text-white text-large font-bold text-center"
          accessibilityRole="header"
        >
          Contraseña actualizada
        </Text>
        <Text className="text-white text-medium text-center">
          Tu contraseña fue actualizada exitosamente. Ya puedes iniciar sesión
          con tu nueva contraseña.
        </Text>
        <Button
          label="Ir a inicio de sesión"
          onPress={() =>replace("/sign-in") }
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dark"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View className="flex-1 bg-dark">
          <View className="content-start bg-dark justify-around mt-10">
            <Text
              className="text-white text-large font-bold my-10 text-center"
              accessibilityRole="header"
            >
              Nueva contraseña
            </Text>
            <Text className="text-white text-medium text-left ml-5 mb-5">
              Ingresa y confirma tu nueva contraseña.
            </Text>

            {screenState === "error" && apiError ? (
              <Text
                className="text-red-400 text-sm text-center mx-5"
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
              >
                {apiError}
              </Text>
            ) : null}

            <View className="mb-10 mx-5 gap-9">
              <Input
                width="100%"
                label="Nueva contraseña"
                placeholder="••••••••"
                value={newPassword}
                onChangeText={(text: string) => {
                  setNewPassword(text);
                  setErrors((prev) => ({ ...prev, newPassword: undefined }));
                  if (screenState === "error") {
                    setScreenState("idle");
                    setApiError("");
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                hasValidation={false}
                error={errors.newPassword}
              />
              <Input
                width="100%"
                label="Confirmar contraseña"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(text: string) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  if (screenState === "error") {
                    setScreenState("idle");
                    setApiError("");
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                hasValidation={false}
                error={errors.confirmPassword}
              />

              <View className="mx-16">
                <Button
                  label={
                    screenState === "loading"
                      ? "Guardando..."
                      : "Guardar nueva contraseña"
                  }
                  onPress={handleSubmit}
                  disabled={screenState === "loading"}

                />
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}