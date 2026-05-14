import {View} from 'react-native';
import { Text } from '@react-native-ama/react-native';
import ReturnButton from '@/components/ui/ReturnButton';
import { router } from 'expo-router';
import { useLayout } from '@/hooks/useLayout';

export default function ShowScreen() {
  const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
  const gap = screenWidth * 0.03;
  const imgWidth = screenWidth * 0.28;
  const imgHeight = imgWidth * 1.5;
  return (
    <View className="flex-1 bg-dark">
      {/* Header */}
      <View
        className="items-start justify-end"
        style={{ padding: gap, gap, width: screenWidth, height: headerHeight }}
        accessible={false}
      >
        <ReturnButton
          label="Volver"
          onPress={() => router.back()}
        />
      </View>
    </View>
  );
}