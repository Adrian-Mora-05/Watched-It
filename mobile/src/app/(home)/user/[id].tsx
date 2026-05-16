import { View } from 'react-native';
import { Text } from '@react-native-ama/react-native';
import { useLocalSearchParams } from 'expo-router';

export default function UserScreen() {

  const { id } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-dark items-center justify-center">

      <Text className="text-white text-xl font-bold">
        Usuario {id}
      </Text>

    </View>
  );
}