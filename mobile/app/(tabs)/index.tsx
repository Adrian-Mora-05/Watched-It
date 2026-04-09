import { View, Text } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Text className="text-primary text-2xl font-bold">Watched It</Text>
      <Text className="text-brown">Some subtitle</Text>
    </View>
  );
}