import {
  View,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
  findNodeHandle,
  ActivityIndicator,
  Pressable,
  Alert,
} from "react-native";

import { Text } from "@react-native-ama/react-native";
import ReturnButton from "@/components/ui/ReturnButton";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useSession } from "@/hooks/ctx";
import { baseUrl } from "@/services/catalog.service";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import ErrorToast from "@/components/ui/ErrorMessage";
import { useCallback, useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { updateLogContent,deleteLogContent, getUserLogById, UserLog,} from "@/services/user.service";
import { useLayout } from "@/hooks/useLayout";

export default function EditLogContent() {
  const { logId, type } = useLocalSearchParams<{
    logId: string;
    type: string;
  }>();

  const { session } = useSession();
  const {
    headerHeight,
    screenWidth,
    screenHeight,
    headerPaddingBottom,
    paddingHorizontal,
    paddingVertical,
  } = useLayout();

  const posterWidth = screenWidth * 0.35;
  const posterHeight = posterWidth * 1.65;
  const starSize = Math.floor((screenWidth * 0.55) / 6);
  const reviewHeight = screenHeight * 0.15;

  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [log, setLog] = useState<UserLog | null>(null);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [toast, setToast] = useState<string | undefined>();

  const titleRef = useRef<View | null>(null);

  const normalizedType =
    type === "movie" || type === "show" ? type : "movie";

  useEffect(() => {
    if (!logId || !session) return;
    loadLog();
  }, [logId, normalizedType, session]);

  const loadLog = async () => {
    try {
      const logData = await getUserLogById(
        Number(logId),
        normalizedType,
        session!
      );

      if (logData) {
        setLog(logData);
        setContent(logData.content);
        setRating(logData.rating);
      }
    } catch {
      setToast("Error cargando log");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  useEffect(() => {
    if (loaded && titleRef.current) {
      const node = findNodeHandle(titleRef.current);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, [loaded]);

  const handleUpdate = useCallback(async () => {
    if (!session || submitting) return;

    if (rating === 0) {
      setToast("Selecciona una puntuación");
      return;
    }

    setSubmitting(true);

    try {
      await updateLogContent(
        Number(logId),
        {
          content,
          rating,
          type_content: normalizedType,
        },
        session!
      );

      AccessibilityInfo.announceForAccessibility("Log actualizado");
      router.back();
    } catch {
      setToast("Error al actualizar");
    } finally {
      setSubmitting(false);
    }
  }, [session, logId, content, rating, normalizedType, submitting]);

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Eliminar reseña",
      "¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            if (!session || deleting) return;
            setDeleting(true);
            try {
              await deleteLogContent(Number(logId), normalizedType, session!);
              AccessibilityInfo.announceForAccessibility("Reseña eliminada");
              router.back();
            } catch {
              setToast("Error al eliminar");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }, [session, logId, normalizedType, deleting]);

  if (loading) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <ErrorToast
          message={toast}
          visible={!!toast}
          onDismiss={() => setToast(undefined)}
        />
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!log) {
    return (
      <View className="flex-1 bg-dark justify-center items-center">
        <Text className="text-white">Log no encontrado</Text>
      </View>
    );
  }

  const uri = `${baseUrl}${decodeURIComponent(log.catalog.poster)}`;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-dark"
      >
        <View className="flex-1">
          <ErrorToast
            message={toast}
            visible={!!toast}
            onDismiss={() => setToast(undefined)}
          />

          {/* HEADER */}
          <View
            className="items-center justify-end bg-chocolate"
            style={{ height: headerHeight, width: screenWidth }}
          >
            <View
              className="flex-row w-full items-center"
              style={{ paddingBottom: headerPaddingBottom }}
            >
              <View className="w-1/6 items-center">
                <ReturnButton
                  label="Volver"
                  showLabel={false}
                  onPress={() => router.back()}
                />
              </View>

              <View className="flex-1 items-center">
                <Text className="text-white text-large font-bold">
                  Editar reseña
                </Text>
              </View>
            </View>
          </View>

          {/* CONTENT */}
          <View className="items-center justify-center">
            <Text
              className="font-bold text-white w-full"
              style={{
                fontSize: screenWidth * 0.05,
                paddingHorizontal,
                marginTop: paddingVertical * 2,
                marginBottom: paddingVertical,
              }}
            >
              {log.catalog.title}
            </Text>

            {/* POSTER + STARS */}
            <View
              className="flex-row w-full justify-between"
              style={{ paddingHorizontal }}
            >
              <Image
                source={{ uri }}
                style={{
                  width: posterWidth,
                  height: posterHeight,
                  borderRadius: screenWidth * 0.025,
                }}
                contentFit="cover"
              />

              <View
                className="justify-center items-center"
                style={{ width: screenWidth * 0.52 }}
              >
                <Text className="text-bone text-center">
                  Edita tu puntuación
                </Text>

                <View className="flex-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setRating(star)}
                      style={{
                        minWidth: 44,
                        minHeight: 44,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <FontAwesome
                        name={rating >= star ? "star" : "star-o"}
                        size={starSize}
                        color="orange"
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            {/* INPUT */}
            <View
              className="w-full"
              style={{
                paddingHorizontal,
                marginTop: headerHeight * 0.2,
              }}
            >
              <Input
                label="Tu reseña"
                height={reviewHeight}
                placeholder="Edita tu reseña aquí..."
                multiline
                numberOfLines={4}
                className="bg-chocolate text-bone rounded-lg px-4 py-3 w-full mt-4"
                value={content}
                onChangeText={setContent}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>

            {/* BUTTONS */}
            <View
              className="flex-row"
              style={{
                gap: screenWidth * 0.12,
                marginTop: paddingVertical,
              }}
            >
              <Button
                label={submitting ? "Guardando..." : "Guardar"}
                onPress={handleUpdate}
                loading={submitting}
                disabled={submitting || deleting}
              />

              <Button
                label="Cancelar"
                onPress={() => router.back()}
                bgColor="#808080"
                disabled={submitting || deleting}
              />
            </View>
          </View>

          {/* BOTÓN FLOTANTE ELIMINAR */}
          <Pressable
            onPress={handleDelete}
            disabled={deleting || submitting}
            accessibilityLabel="Eliminar reseña"
            accessibilityRole="button"
            style={{
              position: "absolute",
              bottom: paddingVertical * 2,
              right: paddingHorizontal,
              width: 52,
              height: 52,
              justifyContent: "center",
              alignItems: "center",
              opacity: deleting || submitting ? 0.5 : 1,
              elevation: 4,
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="trash" size={26} color="white" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}