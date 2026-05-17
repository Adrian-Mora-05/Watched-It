import { View, AccessibilityInfo } from 'react-native';
import { Text } from "@react-native-ama/react-native";
import { useLayout } from '@/hooks/useLayout';
import MenuBar from "@/components/ui/MenuBar";
import { useState, useEffect, useRef } from 'react';
import ShowScreen from './showScreen';
import ReviewScreen from './reviewScreen';
import ListScreen from './listScreen';
import MovieScreen from './movieScreen';

export default function Index() {
  const { headerHeight, screenWidth, headerPaddingBottom, paddingHorizontal, paddingVertical } = useLayout();
  const [tab, setTab] = useState("movieScreen");
  const gap = screenWidth * 0.03;
  const contentRef = useRef(null);

  const tabs = [
    { key: "movieScreen", label: "Películas" },
    { key: "showScreen", label: "Series" },
    { key: "reviewScreen", label: "Reseñas" },
    { key: "listScreen", label: "Listas" },
  ];

  const currentTabLabel = tabs.find(t => t.key === tab)?.label ?? '';


  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`Mostrando ${currentTabLabel}`);
  }, [tab]);

  return (
    <View 
      className='flex-1 bg-dark'
      accessible={false} 
    >
      {/* Header */}
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

      <View 
        className="flex-1" 
        style={{ paddingHorizontal, paddingVertical, gap }}
        accessible={false}
      >
        <MenuBar tabs={tabs} activeTab={tab} onChange={setTab} />

        <View 
          className="flex-1"
          ref={contentRef}
          accessible={false}
          accessibilityLiveRegion="polite"
        >
          {tab === "movieScreen" && <MovieScreen />} 
          {tab === "showScreen" && <ShowScreen />}
          {tab === "reviewScreen" && <ReviewScreen />}
          {tab === "listScreen" && <ListScreen />}
        </View>
      </View>
    </View>
  );
}