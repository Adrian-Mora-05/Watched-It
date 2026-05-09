import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@react-native-ama/react-native';

export default function Chat() {
    const { id } = useLocalSearchParams();

    return (
        <View className="flex-1 bg-dark">
            <Text className="text-white">Chat {id}</Text>
        </View>
    );
}