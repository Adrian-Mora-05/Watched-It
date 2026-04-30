import { View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, AccessibilityInfo, } from "react-native";
import { Text } from "@react-native-ama/react-native";
import { router, useLocalSearchParams } from "expo-router";
import { replace } from "expo-router/build/global-state/routing";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState, useRef } from "react";
import { resetPassword } from "@/services/auth.service";
import { ResetPasswordSchema } from "@shared/password.schema";

type ScreenState = "idle" | "loading" | "success" | "error";

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [apiError, setApiError] = useState<string>("");

  const confirmPasswordRef = useRef<any>(null);

  if (!token) {
    return (
      <View
        className="bg-dark flex-1 items-center justify-center m-5 gap-6"
        accessible={true}
        accessibilityLabel="Enlace inválido. Este enlace expiró o es inválido. Solicita un nuevo correo de restablecimiento."
      >
        <Text className="text-white text-large font-bold text-center" accessibilityRole="header">
          Enlace inválido
        </Text>
        <Text className="text-white text-medium text-center">
          Este enlace expiró o es inválido. Solicita un nuevo correo de restablecimiento.
        </Text>
        <Button label="Volver a inicio de sesión" onPress={() => replace("/sign-in")} />
      </View>
    );
  }

  const validateForm = (): boolean => {
    const result = ResetPasswordSchema.safeParse({ newPassword, confirmPassword, token });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors = {
        newPassword: fieldErrors.newPassword?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
      };
      setErrors(newErrors);
      const errorMessages = Object.values(newErrors).filter(Boolean).join(". ");
      AccessibilityInfo.announceForAccessibility(
        `Formulario con errores. ${errorMessages}. Por favor corrige los campos indicados.`
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
    AccessibilityInfo.announceForAccessibility("Guardando nueva contraseña, por favor espera.");

    resetPassword({ token, newPassword, confirmPassword })
      .then(() => {
        setScreenState("success");
        AccessibilityInfo.announceForAccessibility(
          "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
        );
      })
      .catch((error: any) => {
        const message = "No pudimos actualizar tu contraseña. El enlace puede haber expirado. Por favor solicita un nuevo correo.";
        setApiError(message);
        setScreenState("error");
        AccessibilityInfo.announceForAccessibility(`Error: ${message}`);
      });
  };

  if (screenState === "success") {
    return (
      <View
        className="bg-dark flex-1 items-center justify-center m-5 gap-10"
        accessible={true}
        accessibilityLabel="Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
      >
        <Text className="text-white text-large font-bold text-center" accessibilityRole="header">
          Contraseña actualizada
        </Text>
        <Text className="text-white text-medium text-center">
          Tu contraseña fue actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </Text>
        <Button label="Ir a inicio de sesión" onPress={() => replace("/sign-in")} />
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
          <View className="content-start bg-dark justify-around mt-28 gap-8">
            <View className="mb-10">
            <Text
              className="text-white text-large font-bold my-10 text-center"
              accessibilityRole="header"
            >
              Nueva contraseña
            </Text>
            </View>
            <Text
              className="text-white text-medium text-left ml-5 mb-5"
              accessibilityRole="text"
            >
              Ingresa y confirma tu nueva contraseña. La contraseña debe tener al menos 6 caracteres.
            </Text>

            {screenState === "error" && apiError ? (
              <Text
                className="text-red-400 text-sm text-center mx-5 mb-3"
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
                accessibilityLabel={`Error: ${apiError}`}
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
                  if (screenState === "error") { setScreenState("idle"); setApiError(""); }
                }}
                secureTextEntry
                autoCapitalize="none"
                hasValidation={false}
                error={errors.newPassword}
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                accessibilityLabel="Nueva contraseña"
                accessibilityHint="Ingresa tu nueva contraseña, mínimo 6 caracteres"
              />
              <Input
                ref={confirmPasswordRef}
                width="100%"
                label="Confirmar contraseña"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={(text: string) => {
                  setConfirmPassword(text);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  if (screenState === "error") { setScreenState("idle"); setApiError(""); }
                }}
                secureTextEntry
                autoCapitalize="none"
                hasValidation={false}
                error={errors.confirmPassword}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                accessibilityLabel="Confirmar contraseña"
                accessibilityHint="Repite tu nueva contraseña para confirmarla"
              />

              <View className="mt-5 gap-10 flex-row justify-between">
                <Button
                  label={screenState === "loading" ? "Guardando..." : "Guardar nueva contraseña"}
                  onPress={handleSubmit}
                  disabled={screenState === "loading"}
                  loading={screenState === "loading"}
                />
                                <Button
                  label="Cancelar"
                  onPress={() => router.replace("/sign-in")}
                  bgColor= "#808080"
                  disabled={screenState === "loading"}
                  loading={screenState === "loading"}
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}