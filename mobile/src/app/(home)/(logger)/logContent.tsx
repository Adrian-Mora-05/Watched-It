import { View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from "react-native";
import { Pressable, Text } from "@react-native-ama/react-native";
import ReturnButton from "@/components/ui/ReturnButton";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useSession } from '@/hooks/ctx';
import { baseUrl } from "@/services/catalog.service";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ErrorToast from '@/components/ui/ErrorMessage';
import { useCallback, useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { logContent } from "@/services/user.service";
import { AccessibilityInfo, findNodeHandle } from "react-native";
import { useLayout } from "@/hooks/useLayout";

export default function LogContent() {
    const { id_content, title, type, link } = useLocalSearchParams<{
        id_content: string;
        title: string;
        type: string;
        link: string;
    }>();

    const {
        headerHeight,
        screenWidth,
        screenHeight,
        headerPaddingBottom,
        paddingHorizontal,
        paddingVertical,
    } = useLayout();

    // Poster: ~35% of screen width, 1.65 aspect ratio
    const posterWidth = screenWidth * 0.35;
    const posterHeight = posterWidth * 1.65;

    // Star size: fits 5 stars in remaining width with padding
    const starSize = Math.floor((screenWidth * 0.55) / 6);

    // Review input height: ~20% of screen height
    const reviewHeight = screenHeight * 0.20;

    const { session } = useSession();
    const uri = `${baseUrl}${decodeURIComponent(link)}`;
    const [toastMessage, setToastMessage] = useState<string | undefined>();
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const titleRef = useRef(null);

    useEffect(() => {
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded && titleRef.current) {
            const node = findNodeHandle(titleRef.current);
            if (node) AccessibilityInfo.setAccessibilityFocus(node);
        }
    }, [loaded]);

    const handleSubmit = useCallback(async () => {
        if (!session) {
            setToastMessage("No hay sesión activa");
            return;
        }
        if (rating === 0) {
            setToastMessage("Por favor selecciona una puntuación");
            return;
        }
        setSubmitting(true);
        try {
            await logContent({ content, id_content: parseInt(id_content), rating, type_content: type }, session);
            AccessibilityInfo.announceForAccessibility(`${title} registrada exitosamente`);
            router.replace('/(home)');
        } catch (e) {
            setToastMessage("Error al registrar el contenido");
        } finally {
            setSubmitting(false);
        }
    }, [session, rating, content, id_content, type, title]);

    if (!loaded) return null;

    const typeLabel = type === 'Movie' ? 'película' : 'serie';

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 bg-dark"
            >
                <View className="flex-1">
                    <ErrorToast
                        message={toastMessage}
                        visible={!!toastMessage}
                        onDismiss={() => setToastMessage(undefined)}
                    />

                    {/* Header */}
                    <View
                        className="items-center justify-end bg-chocolate"
                        style={{ height: headerHeight, width: screenWidth }}
                    >
                        <View
                            className="flex-row w-full items-center"
                            style={{ paddingBottom: headerPaddingBottom }}
                        >
                            {/* Left — back button */}
                            <View className="w-1/6 items-center">
                                <ReturnButton label="Volver" showLabel={false} onPress={() => router.back()} />
                            </View>

                            {/* Center — title takes remaining space, truly centered */}
                            <View className="flex-1 items-center">
                                <Text
                                    accessibilityRole="header"
                                    className="text-white text-large font-bold text-center"
                                >
                                    Nueva entrada
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="items-center justify-center">

                        {/* Title */}
                        <Text
                            autofocus
                            accessibilityRole="header"
                            accessibilityLabel={`${title}, ${typeLabel}`}
                            className="font-bold text-white w-full"
                            style={{
                                fontSize: screenWidth * 0.05,
                                paddingHorizontal,
                                marginTop: paddingVertical * 2,
                                marginBottom: paddingVertical,
                            }}
                        >
                            {title}
                        </Text>

                        {/* Poster + Stars row */}
                        <View
                            className="flex-row w-full justify-between"
                            style={{ paddingHorizontal }}
                        >
                            {/* Poster */}
                            <Image
                                source={{ uri }}
                                style={{
                                    width: posterWidth,
                                    height: posterHeight,
                                    borderRadius: screenWidth * 0.025,
                                    marginBottom: paddingVertical,
                                }}
                                contentFit="cover"
                                cachePolicy="disk"
                                accessibilityLabel={`Póster de ${title}`}
                                accessibilityRole="image"
                            />

                            {/* Stars */}
                            <View
                                className="justify-center items-center"
                                accessibilityLabel={`Puntuación: ${rating} de 5 estrellas`}
                                accessibilityRole="adjustable"
                                accessibilityLanguage="es"
                                style={{ width: screenWidth * 0.52 }}
                            >
                                <Text
                                    className="text-bone text-center"
                                    style={{
                                        fontSize: screenWidth * 0.038,
                                        marginBottom: paddingVertical * 1.5,
                                    }}
                                >
                                    ¿Qué puntuación le das?
                                </Text>
                                <View className="flex-row" style={{ gap: screenWidth * 0.0001 }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Pressable
                                            key={star}
                                            onPress={() => setRating(star)}
                                            accessibilityRole="button"
                                            accessibilityLanguage="es"
                                            accessibilityLabel={`${star} estrella${star > 1 ? 's' : ''}`}
                                            accessibilityHint={
                                                rating === star
                                                    ? "Puntuación actual seleccionada"
                                                    : `Toca para dar ${star} estrella${star > 1 ? 's' : ''}`
                                            }
                                            accessibilityState={{ selected: rating >= star }}
                                            style={{
                                                minWidth: 44,
                                                minHeight: 44,
                                                alignItems: 'center',
                                                justifyContent: 'center',
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

                        {/* Review input */}
                        <View
                            className="w-full"
                            style={{ paddingHorizontal, marginTop: paddingVertical/5 }}
                        >
                            <Input
                                label="¿Qué te pareció la película o serie?"
                                height={reviewHeight}
                                placeholder="Escribe tu reseña aquí..."
                                multiline
                                numberOfLines={4}
                                className="bg-chocolate text-bone rounded-lg px-4 py-3 w-full mt-4"
                                value={content}
                                onChangeText={setContent}
                                accessibilityLanguage="es"
                                accessibilityHint="Campo opcional. Escribe tu opinión sobre el contenido"
                                returnKeyType="done"
                                blurOnSubmit
                                onSubmitEditing={Keyboard.dismiss}
                            />
                        </View>

                        {/* Buttons */}
                        <View
                            className="flex-row"
                            style={{
                                gap: screenWidth * 0.12,
                                marginTop: paddingVertical,
                            }}
                        >
                            <Button
                                label={submitting ? "Registrando..." : "Continuar"}
                                onPress={handleSubmit}
                                loading={submitting}
                                disabled={submitting}
                            />
                            <Button
                                label="Cancelar"
                                onPress={() => router.back()}
                                bgColor="#808080"
                                disabled={submitting}
                            />
                        </View>

                    </View>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}