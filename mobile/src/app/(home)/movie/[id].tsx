import {View} from 'react-native';
import { Text } from '@react-native-ama/react-native';
import RatingsDistribution from '@/components/ui/BarGraphic';
import { useLayout } from '@/hooks/useLayout';

export default function ShowScreen() {
    const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
    const gap = screenWidth * 0.03;
  return (
    <View>
            <View 
        className="items-center justify-end bg-chocolate"
        style={{ height: headerHeight, width: screenWidth }}
        accessible={true}
        accessibilityRole="header"
      >
        <Text
          accessibilityRole="header"
          accessibilityLanguage="es"  
          className="text-white text-large font-bold"
          style={{ paddingBottom: headerPaddingBottom }}
        >
          Watched It
        </Text>
      </View>
      <Text>Moview Screen</Text>
      <RatingsDistribution
  ratings={[
    { estrellas: 5, cantidad: 120 },
    { estrellas: 4, cantidad: 80 },
    { estrellas: 3, cantidad: 40 },
    { estrellas: 2, cantidad: 15 },
    { estrellas: 1, cantidad: 5 },
  ]}
/>
    </View>
  );
}