import { View } from "react-native";
import { Text } from "@react-native-ama/react-native";
import ReturnButton from "@/components/ui/ReturnButton";
import { router, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import {baseUrl} from "@/services/catalog.service";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import ErrorToast from '@/components/ui/ErrorMessage';
import { useState } from "react";

export default function LogContent() {
    const { id, title, type,link } = useLocalSearchParams<{
        id: string;
        title: string;
        type: string;
        link: string;
    }>();
    const uri = `${baseUrl}${decodeURIComponent(link)}`;
    const [toastMessage, setToastMessage] = useState<string | undefined>();

    return(
            <View className="flex-1">
                <ReturnButton label="Volver" onPress={() => router.back()} />
                <ErrorToast
                    message={toastMessage}
                    visible={!!toastMessage}
                    onDismiss={() => setToastMessage(undefined)}
                />
                <View className='bg-chocolate h-36 items-center justify-end'>
                    <Text className="text-white text-large font-bold pb-7">Nueva entrada</Text>
                </View>
            <View className="items-center justify-center">
                <Text className="text-2xl font-bold text-white mb-2">{title}</Text>
                <FontAwesome name="star" size={24} color="orange" />
                <Feather name="star" size={24} color="orange" />
                
                <Image 
                source={{ uri }}
                style={{ width: 202, height: 298 }}
                contentFit="cover"
                className="rounded-lg mb-4"
                />
                <Text className="text-lg text-gray-400 mb-4">{type}</Text>
             </View>
             <View className="flex-1 items-center justify-center">
                <Text className="text-2xl font-bold text-white">
                    aca seria ya la accion de logger en sí
                </Text>
        </View>
</View>
    )
}