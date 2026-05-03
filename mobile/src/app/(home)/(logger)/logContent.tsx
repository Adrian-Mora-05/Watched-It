import { View,Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, ActivityIndicator, } from "react-native";
import { Pressable, Text } from "@react-native-ama/react-native";
import ReturnButton from "@/components/ui/ReturnButton";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { useSession } from '@/hooks/ctx';
import {baseUrl} from "@/services/catalog.service";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ErrorToast from '@/components/ui/ErrorMessage';
import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {logContent} from "@/services/user.service";

export default function LogContent() {
    const { id_content, title, type,link } = useLocalSearchParams<{
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
    
    return(
        
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                  <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 bg-dark"
                  >
            <View className="flex-1 ">
                <ErrorToast
                    message={toastMessage}
                    visible={!!toastMessage}
                    onDismiss={() => setToastMessage(undefined)}
                />
                <View className="bg-chocolate h-36 justify-end pb-4">
                    <View className="flex-row items-center px-2">
                        <ReturnButton label="Volver" showLabel={false} onPress={() => router.back()} />
                        <Text className="text-white text-large font-bold absolute left-0 right-0 text-center pt-14">
                        Nueva entrada
                        </Text>
                    </View>
                </View>
                <View className="items-center justify-center">
                    <Text className="text-intermediate font-bold text-white w-full pl-6 mt-9 mb-4">{title}</Text>
                    <View className=" flex-row w-full px-6 justify-between">
                        <Image 
                        source={{ uri }}
                        style={{ width: 132, height: 218 }}
                        contentFit="cover"
                        className="rounded-lg mb-4"
                        />
                        <View className=" justify-center items-center">
                            <Text className="text-medium text-bone mb-6">¿Qué puntuación le das?</Text>
                                <View className="flex-row gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Pressable
                                    key={star}
                                    onPress={() => setRating(star)}
                                    accessibilityRole="button"
                                    accessibilityLabel={`${star} estrella${star > 1 ? 's' : ''}`}
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
                        />
                    </View>
                    <View className="flex-row gap-24 mt-8">
                        <Button
                            label="Continuar"
                            onPress={async () => {
                                if (!session) {
                                    setToastMessage("No hay sesión activa");
                                    return;
                                }
                                try {
                                    await logContent({ content, id_content: parseInt(id_content), rating, type_content: type }, session);
                                    router.replace('/(home)');
                                } catch (e) {
                                    setToastMessage("Error al registrar el contenido");
                                }
                                }}
                        />
                        <Button
                            label="Cancelar"
                            onPress={() => router.back()}
                            bgColor= "#808080"
                        />
                    </View>
                </View>
        </View>
        </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}