import { View } from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { useLayout } from '@/hooks/useLayout';
import MenuBar from "@/components/ui/MenuBar";
import { useState } from 'react';
import ShowScreen from './showScreen';
import ReviewScreen from './reviewScreen';
import ListScreen from './listScreen';
import MovieScreen from './movieScreen';

export default function Index() {
  const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
  const [tab, setTab] = useState("movieScreen");
  const gap = screenWidth * 0.03;

  const tabs = [
    { key: "movieScreen", label: "Películas" },
    { key: "showScreen", label: "Series" },
    { key: "reviewScreen", label: "Reseñas" },
    { key: "listScreen", label: "Listas" },
  ];

  return (
  <View className='flex-1 bg-dark'>
    {/* Header */}
    <View className="items-center justify-end bg-chocolate"
        style={{ height: headerHeight, width: screenWidth }}>
      <Text
        accessibilityRole="header"
        accessibilityLanguage="en"
        className="text-white text-large font-bold"
        style={{ paddingBottom: headerPaddingBottom }}
      >
        Watched It
      </Text>
    </View>


    <View className="flex-1" style={{ paddingHorizontal, paddingVertical, gap }}>
      <MenuBar tabs={tabs} activeTab={tab} onChange={setTab} />

      <View className="flex-1">
        {tab === "movieScreen" && <MovieScreen />} 
        {tab === "showScreen" && <ShowScreen />}
        {tab === "reviewScreen" && <ReviewScreen />}
        {tab === "listScreen" && <ListScreen />}
      </View>

    </View>
  </View>
);
}