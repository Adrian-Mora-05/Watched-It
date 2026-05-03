import { View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from "react-native";
import { Pressable, Text } from "@react-native-ama/react-native";
import ReturnButton from "@/components/ui/ReturnButton";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useSession } from '@/hooks/ctx';
import { baseUrl } from "@/services/catalog.service";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ErrorToast from '@/components/ui/ErrorMessage';
import { useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { logContent } from "@/services/user.service";
import { AccessibilityInfo, findNodeHandle } from "react-native";

export default function LogContent() {
    const { id_content, title, type, link } = useLocalSearchParams<{
        id_content: string;
        title: string;
        type: string;
        link: string;
    }>();
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

    // Move focus to title on load for screen readers
    useEffect(() => {
        if (loaded && titleRef.current) {
            const node = findNodeHandle(titleRef.current);
            if (node) AccessibilityInfo.setAccessibilityFocus(node);
        }
    }, [loaded]);

    if (!loaded) return null;

    const typeLabel = type === 'Movie' ? 'película' : 'serie';

    const handleSubmit = async () => {
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
    };

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
                    <View className="bg-chocolate h-36 justify-end pb-4">
                        <View className="flex-row items-center px-2">
                            <ReturnButton label="Volver" showLabel={false} onPress={() => router.back()} />
                            <Text
                                accessibilityRole="header"
                                className="text-white text-large font-bold absolute left-0 right-0 text-center pt-14"
                            >
                                Nueva entrada
                            </Text>
                        </View>
                    </View>

                    <View className="items-center justify-center">

                        {/* Title */}
                        <Text
                            autofocus
                            accessibilityRole="header"
                            accessibilityLabel={`${title}, ${typeLabel}`}
                            className="text-intermediate font-bold text-white w-full pl-6 mt-9 mb-4"
                        >
                            {title}
                        </Text>

                        <View className="flex-row w-full px-6 justify-between">

                            {/* Poster */}
                            <Image
                                source={{ uri }}
                                style={{ width: 132, height: 218 }}
                                contentFit="cover"
                                className="rounded-lg mb-4"
                                accessibilityLabel={`Póster de ${title}`}
                                accessibilityRole="image"
                            />

                            {/* Stars */}
                            <View
                                className="justify-center items-center"
                                accessibilityLabel={`Puntuación: ${rating} de 5 estrellas`}
                                accessibilityRole="adjustable"
                                accessibilityLanguage="es"
                            >
                                <Text className="text-medium text-bone mb-6">
                                    ¿Qué puntuación le das?
                                </Text>
                                <View className="flex-row gap-1">
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
                                            style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <FontAwesome
                                                name={rating >= star ? "star" : "star-o"}
                                                size={44}
                                                color="orange"
                                            />
                                        </Pressable>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* Review input */}
                        <View className="mt-6 w-full px-7">
                            <Input
                                label="¿Qué te pareció la película o serie?"
                                height={225}
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
                            className="flex-row gap-24 mt-8"
                            accessibilityLanguage="es"
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