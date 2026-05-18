import { router } from 'expo-router';
import { View, ActivityIndicator, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useState } from "react";
import { Text } from "@react-native-ama/react-native";
import MenuBar from "@/components/ui/MenuBar";
import SettingButton from '@/components/ui/SettingButton';
import DiaryScreen from './(diary)';
import MyProfileScreen from './profile';
import WatchlistScreen from './watchlist';
import UserListsScreen from './(lists)';
import { useSession } from '@/hooks/ctx';
import { Image } from 'expo-image';
import { useLayout } from '@/hooks/useLayout';

export default function ProfileScreen() {
  
  const [tab, setTab] = useState("userProfile");
  const { user, isLoadingUser} = useSession();
  const { headerPaddingBottom, headerHeight,screenWidth } = useLayout();
  const gap = screenWidth * 0.03;


  if (isLoadingUser) {
    return (
      <View className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="white" accessibilityLabel="Cargando perfil" />
      </View>
    );
  }
  
  const tabs = [
    { key: "userProfile", label: "Mi perfil" },
    { key: "diary", label: "Diario" },
    { key: "lists", label: "Listas" },
    { key: "watchlist", label: "Por ver" },
  ];

  return ( 
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-dark"
        >
        <View className="flex-1 bg-dark">
          <View
          className="bg-chocolate flex-row items-center"
          style={{
            height: headerHeight,
            paddingHorizontal: gap,
            paddingTop: 10,
          }}
        >
            
            <SettingButton onPress={() => router.push("/settings")} />
            
            <Text
            className="text-white text-large font-bold"
            style={{
              flex: 1,
              textAlign: 'center',
              marginHorizontal: 12,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
              {user?.name || "Usuario"}
            </Text>

            <Image
              source={
                user?.profilePicture
                  ? { uri: user.profilePicture }
                  : require('../../../../../assets/images/default-profile-pic.png')
              }
              style={{
                width: Math.min(screenWidth * 0.16, 72),
                height: Math.min(screenWidth * 0.16, 72),
                borderRadius: 999,
              }}
              contentFit="cover"
              cachePolicy="none"
            />
        
          </View>
          <View className="px-4 mt-6 ">
              <MenuBar
                tabs={tabs}
                activeTab={tab}
                onChange={setTab}
            />
          </View>
          <View className="flex-1 p-5 ">
            {tab === "userProfile" && <MyProfileScreen />}
            {tab === "diary" && <DiaryScreen />}
            {tab === "lists" && <UserListsScreen />} 
            {tab === "watchlist" &&<WatchlistScreen />}
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
