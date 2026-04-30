import { View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, AccessibilityInfo, } from "react-native";
import { Text } from "@react-native-ama/react-native";
import { router } from "expo-router";
import ReturnButton from "@/components/ui/ReturnButton";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useState } from "react";
import { ForgotPasswordSchema } from "@shared/password.schema";
import { sendEmail } from "@/services/auth.service";

type ScreenState = "idle" | "loading" | "success" | "error";

export default function ForgotPasswordScreen() {
  const [username, setUser] = useState("");
  const [errors, setErrors] = useState<{ username?: string }>({});
  const [screenState, setScreenState] = useState<ScreenState>("idle");
  const [apiError, setApiError] = useState<string>("");

  const validateForm = (): boolean => {
    const result = ForgotPasswordSchema.safeParse({ username });

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const newErrors = { username: fieldErrors.username?.[0] };
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
    AccessibilityInfo.announceForAccessibility(
      "Enviando correo de restablecimiento, por favor espera."
    );

    sendEmail(ForgotPasswordSchema.parse({ username }))
      .then(() => {
        setScreenState("success");
        AccessibilityInfo.announceForAccessibility(
          "Correo de restablecimiento enviado. Revisa tu bandeja de entrada y también tu carpeta de spam."
        );
      })
      .catch((error) => {
        const message = "No pudimos enviar el correo. Intenta de nuevo más tarde.";
        setApiError(message);
        setScreenState("error");
        AccessibilityInfo.announceForAccessibility(`Error: ${message}`);
      });
  };

  if (screenState === "success") {
    return (
      <View className="bg-dark flex-1">
        <ReturnButton
          label="Volver a inicio de sesión"
          onPress={() => router.back()}
        />
        <View
          className="bg-dark flex-1 items-center justify-center mx-5 gap-10 pb-40"
          accessible={true}
          accessibilityLabel={`Revisa tu correo. Si existe una cuenta asociada al usuario ${username}, recibirás un correo con instrucciones para restablecer tu contraseña. Recuerda revisar también tu carpeta de spam.`}
        >
          <Text
            className="text-white text-large font-bold"
            accessibilityRole="header"
          >
            Revisa tu correo
          </Text>
          <Text className="text-white text-medium ">
            Si existe una cuenta asociada al usuario{" "}
            <Text className="font-bold">{username}</Text>, recibirás un correo
            con instrucciones para restablecer tu contraseña. Recuerda revisar
            también tu carpeta de spam o correo no deseado.
          </Text>

        </View>
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
          <ReturnButton
            label="Volver a inicio de sesión"
            onPress={() => router.back()}
          />

          <View className="content-start bg-dark justify-around mt-10">
            <Text
              className="text-white text-large font-bold text-center"
              accessibilityRole="header"
            >
              Cambia tu contraseña
            </Text>
            <Text
              className="text-white text-medium text-left mx-5 mt-32 pt-14 mb-8"
              accessibilityRole="text"
            >
              Ingresa tu nombre de usuario para recibir un correo con instrucciones para restablecer tu contraseña.
            </Text>

            {screenState === "error" && apiError ? (
              <Text
                className="text-red-400 text-petite text-center"
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
                label="Nombre de usuario"
                placeholder="usuario123"
                value={username}
                onChangeText={(text: string) => {
                  setUser(text);
                  setErrors({});
                  if (screenState === "error") {
                    setScreenState("idle");
                    setApiError("");
                  }
                }}
                keyboardType="default"
                autoCapitalize="none"
                hasValidation={false}
                error={errors.username}
                returnKeyType="send"
                onSubmitEditing={handleSubmit}
                accessibilityLabel="Nombre de usuario"
                accessibilityHint="Ingresa el nombre de usuario asociado a tu cuenta"
              />
              <View className="mx-16">
                <Button
                  label={
                    screenState === "loading"
                      ? "Enviando..."
                      : "Enviar correo de restablecimiento"
                  }
                  onPress={handleSubmit}
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