import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text } from "@react-native-ama/react-native";
import { View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ButtonProps = {
  label: string;
  onPress: () => void;
  showLabel?: boolean;
};

export default function ReturnButton({ label, onPress, showLabel = true }: ButtonProps) {
  return (
    <View>
    <Pressable
      accessibilityLanguage="es"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        width: 48,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View className='flex-row items-center'>
        <Ionicons name="arrow-back" size={24} color="white" />
        {showLabel && (
          <Text className="text-normal text-white ml-2">
            Volver
          </Text>
          
        )}
        </View>
    </Pressable>
    </View>
  );
}