import { ScrollView, View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from "react-native";
import { Pressable, Text } from "@react-native-ama/react-native";
import ReturnButton from "@/components/ui/ReturnButton";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useSession } from '@/hooks/ctx';
import { baseUrl } from "@/services/catalog.service";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ErrorToast from '@/components/ui/ErrorMessage';
import OkayToast from '@/components/ui/OkayMessage';
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

    // Review input height: ~20% of screen height
    const reviewHeight = screenHeight * 0.15;

    const { session } = useSession();
    const uri = `${baseUrl}${decodeURIComponent(link)}`;
    const [toastMessage, setToastMessage] = useState<string | undefined>();
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | undefined>();
    

    useEffect(() => {
        setLoaded(true);
    }, []);


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
            setSuccessMessage(`${title} registrada exitosamente`);
            AccessibilityInfo.announceForAccessibility(`${title} registrada exitosamente`);
            setTimeout(() => {
                router.replace('/(home)');
            }, 1500);
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
                    <ReturnButton
                        label="Volver"
                        showLabel={false}
                        onPress={() => router.back()}
                    />
                    </View>

                    {/* Center — title */}
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

                <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    paddingBottom: paddingVertical * 3,
                }}
                >
                <View className="items-center justify-center">

                    {/* Title */}
                    <Text
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

                    {/* Poster + Stars */}
                    <View
                    className="w-full"
                    style={{ paddingHorizontal }}
                    >
                    <View
                        style={{
                        flexDirection: 'row',
                        gap: screenWidth * 0.04,
                        marginBottom: paddingVertical,
                        }}
                    >
                        {/* Poster */}
                        <Image
                        source={{ uri }}
                        style={{
                            width: posterWidth,
                            height: posterHeight,
                            borderRadius: screenWidth * 0.025,
                        }}
                        contentFit="cover"
                        cachePolicy="disk"
                        accessibilityLabel={`Póster de ${title}`}
                        accessibilityRole="image"
                        />

                        {/* Stars */}
                        <View style={{ flex: 1 }}>
                        <Text
                            className="text-bone text-center"
                            style={{
                            fontSize: screenWidth * 0.038,
                            marginBottom: paddingVertical,
                            textAlign: 'center',
                            }}
                        >
                            ¿Qué puntuación le das?
                        </Text>

                        <View
                            style={{
                            flexDirection: 'row',
                            justifyContent: 'space-evenly',
                            alignItems: 'center',
                            width: '100%',
                            }}
                        >
                            {[1, 2, 3, 4, 5].map((star) => (
                            <Pressable
                                key={star}
                                onPress={() => setRating(star)}
                                accessibilityRole="button"
                                accessibilityLabel={`${star} estrella${star > 1 ? 's' : ''}`}
                                accessibilityState={{ selected: rating >= star }}
                                style={{
                                width: 48,
                                height: 48,
                                alignItems: 'center',
                                justifyContent: 'center',
                                }}
                            >
                                <FontAwesome
                                name={rating >= star ? "star" : "star-o"}
                                size={26}
                                color="#AA500F"
                                />
                            </Pressable>
                            ))}
                        </View>
                        </View>
                    </View>
                    </View>

                    {/* Review */}
                    <View
                    className="w-full"
                    style={{ paddingHorizontal, marginTop: paddingVertical / 2 }}
                    >
                    <Input
                        label="¿Qué te pareció?"
                        height={reviewHeight}
                        placeholder="Escribe tu reseña aquí..."
                        multiline
                        numberOfLines={4}
                        className="bg-chocolate text-bone rounded-lg px-4 py-3 w-full mt-4"
                        value={content}
                        onChangeText={setContent}
                        accessibilityLanguage="es"
                        accessibilityHint="Campo opcional. Escribe tu opinión"
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
                        marginTop: paddingVertical * 2,
                        marginBottom: paddingVertical * 2,
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
                </ScrollView>

                <OkayToast
                message={successMessage}
                visible={!!successMessage}
                onDismiss={() => setSuccessMessage(undefined)}
                />

            </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
}